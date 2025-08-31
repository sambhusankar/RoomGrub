// Push Notification Service Worker for RoomGrub

// Install event
self.addEventListener('install', (event) => {
    console.log('Push SW installing');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Push SW activating');
    self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
    console.log('Push event received:', event);
    
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

    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification click received:', event);
    
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
    console.log('SW received message:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});