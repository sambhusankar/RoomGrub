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

    // Skip waiting and claim clients
    workbox.core.skipWaiting();
    workbox.core.clientsClaim();

    // Precache manifest (will be injected by Workbox during build)
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

    // Cache strategies for different routes

    // Network first for start URL
    workbox.routing.registerRoute(
        '/',
        new workbox.strategies.NetworkFirst({
            cacheName: 'start-url',
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

    // Network only for all other routes (development mode)
    workbox.routing.registerRoute(
        /.*/,
        new workbox.strategies.NetworkOnly({
            cacheName: 'dev',
            plugins: []
        }),
        'GET'
    );

    console.log('Workbox routes registered');
} else {
    console.error('Workbox failed to load');
}

console.log('RoomGrub Service Worker initialized');
