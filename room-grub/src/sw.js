// Custom Service Worker for RoomGrub with Push Notifications
// This file is the source for the service worker and won't be auto-formatted

// Import Workbox libraries
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// ===================================================================
// PUSH NOTIFICATION HANDLERS (Registered first, before Workbox setup)
// ===================================================================

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
    console.log('Push event received in service worker:', event);

    let notificationData = {
        title: 'RoomGrub Notification',
        body: 'You have a new notification',
        icon: '/icons/logo-192.png',
        badge: '/icons/logo-72.png',
        tag: 'roomgrub-notification',
        data: {}
    };

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = { ...notificationData, ...data };
            console.log('Parsed push data:', data);
        } catch (error) {
            console.error('Error parsing push data:', error);
            notificationData.body = event.data.text();
        }
    }

    const options = {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag,
        data: notificationData.data,
        actions: notificationData.actions || [
            {
                action: 'view',
                title: 'View Room',
                icon: '/icons/logo-48.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        requireInteraction: false,
        vibrate: [200, 100, 200],
        timestamp: Date.now()
    };

    console.log('Showing notification with options:', options);

    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification click received in service worker:', event);

    event.notification.close();

    const action = event.action;
    const data = event.notification.data;

    if (action === 'dismiss') {
        return;
    }

    // Default action or 'view' action
    let url = '/';
    if (data && data.roomId) {
        url = `/${data.roomId}`;

        // Navigate to specific sections based on activity type
        if (data.activityType === 'grocery') {
            url += '/addgroccery';
        } else if (data.activityType === 'payment') {
            url += '/payments';
        } else if (data.activityType === 'expense') {
            url += '/expenses';
        } else if (data.activityType === 'member_join') {
            url += '/members';
        }
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window/tab open with the target URL or base room URL
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (data && data.roomId) {
                        if (client.url.includes(`/${data.roomId}`) && 'focus' in client) {
                            // If same room is open, navigate to specific section
                            client.postMessage({
                                type: 'NOTIFICATION_CLICK',
                                data: data
                            });
                            return client.focus();
                        }
                    }
                }

                // If no existing window/tab, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
    console.log('Service worker received message:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('Push notification handlers registered');

// ===================================================================
// WORKBOX CONFIGURATION (After push handlers are registered)
// ===================================================================

if (workbox) {
    console.log('Workbox loaded successfully');

    // Load additional modules for caching strategies
    workbox.loadModule('workbox-cacheable-response');
    workbox.loadModule('workbox-expiration');

    // Skip waiting and claim clients
    workbox.core.skipWaiting();
    workbox.core.clientsClaim();

    // Precache manifest (will be injected by Workbox during build)
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

    // =========================================
    // STATIC ASSETS - CacheFirst (long-term cache)
    // =========================================

    // Cache Google Fonts stylesheets
    workbox.routing.registerRoute(
        /^https:\/\/fonts\.googleapis\.com/,
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'google-fonts-stylesheets',
        })
    );

    // Cache Google Fonts webfont files
    workbox.routing.registerRoute(
        /^https:\/\/fonts\.gstatic\.com/,
        new workbox.strategies.CacheFirst({
            cacheName: 'google-fonts-webfonts',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                    maxEntries: 30,
                }),
            ],
        })
    );

    // Cache static assets (images, icons)
    workbox.routing.registerRoute(
        /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
        new workbox.strategies.CacheFirst({
            cacheName: 'static-images',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                }),
            ],
        })
    );

    // =========================================
    // STATIC PAGES - StaleWhileRevalidate
    // =========================================

    // Login page - fully static, can work offline
    workbox.routing.registerRoute(
        ({ url }) => url.pathname === '/login' || url.pathname === '/login/',
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'static-pages',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
            ],
        }),
        'GET'
    );

    // Create room page - static shell
    workbox.routing.registerRoute(
        ({ url }) => url.pathname === '/create_room' || url.pathname === '/create_room/',
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'static-pages',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
            ],
        }),
        'GET'
    );

    // =========================================
    // ROOM DASHBOARD - CacheFirst (fully offline after first visit)
    // =========================================

    // Room dashboard pages (e.g., /abc123, /room-xyz)
    // These are fully client-side now, no server data needed
    // Match: /{room_id} but NOT /{room_id}/expenses, etc.
    workbox.routing.registerRoute(
        ({ url }) => {
            const pathname = url.pathname;
            // Exclude known static routes, API routes, and Next.js internal routes
            const excludedPaths = ['login', 'callback', 'create_room', 'offline', 'api', '_next'];
            const segments = pathname.split('/').filter(Boolean);

            // Match single-segment paths that look like room IDs
            if (segments.length === 1) {
                const segment = segments[0];
                return !excludedPaths.includes(segment) && !segment.startsWith('_');
            }
            return false;
        },
        new workbox.strategies.CacheFirst({
            cacheName: 'room-dashboard',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 10, // Cache up to 10 room dashboards
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                }),
            ],
        }),
        'GET'
    );

    // =========================================
    // DYNAMIC DATA ROUTES - NetworkOnly
    // =========================================

    // API routes - always need network
    workbox.routing.registerRoute(
        /\/api\//,
        new workbox.strategies.NetworkOnly(),
        'GET'
    );

    // Supabase API calls - always need network
    workbox.routing.registerRoute(
        /supabase/,
        new workbox.strategies.NetworkOnly()
    );

    // =========================================
    // ADD GROCERY PAGE - CacheFirst (static form, offline after first visit)
    // =========================================
    workbox.routing.registerRoute(
        ({ url }) => {
            const segments = url.pathname.split('/').filter(Boolean);
            return segments.length === 2 && segments[1] === 'addgroccery';
        },
        new workbox.strategies.CacheFirst({
            cacheName: 'addgroccery-page',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                }),
            ],
        }),
        'GET'
    );

    // Dynamic room sub-pages (expenses, payments, balance, etc.)
    // These require fresh DB data and should not be cached
    workbox.routing.registerRoute(
        ({ url }) => {
            const pathname = url.pathname;
            const segments = pathname.split('/').filter(Boolean);
            // Match: /{room_id}/{subpage} patterns (2+ segments)
            return segments.length >= 2 &&
                   !segments[0].startsWith('_') &&
                   segments[0] !== 'api';
        },
        new workbox.strategies.NetworkOnly(),
        'GET'
    );

    // =========================================
    // START URL - NetworkFirst with redirect handling
    // =========================================

    workbox.routing.registerRoute(
        '/',
        new workbox.strategies.NetworkFirst({
            cacheName: 'start-url',
            networkTimeoutSeconds: 3,
            plugins: [
                {
                    cacheWillUpdate: async ({ response }) => {
                        if (response && response.type === 'opaqueredirect') {
                            return new Response(response.body, {
                                status: 200,
                                statusText: 'OK',
                                headers: response.headers
                            });
                        }
                        return response;
                    }
                }
            ]
        }),
        'GET'
    );

    // =========================================
    // NEXT.JS STATIC CHUNKS - CacheFirst
    // =========================================

    // Cache Next.js static chunks for offline support
    workbox.routing.registerRoute(
        /\/_next\/static\/.*/,
        new workbox.strategies.CacheFirst({
            cacheName: 'next-static',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                }),
            ],
        })
    );

    console.log('Workbox routes registered with offline support');
} else {
    console.error('Workbox failed to load');
}

console.log('RoomGrub Service Worker initialized');
