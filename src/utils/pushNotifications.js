class PushNotificationManager {
    constructor() {
        this.registration = null;
    }

    // Check if push notifications are supported
    isSupported() {
        const hasServiceWorker = 'serviceWorker' in navigator;
        const hasPushManager = 'PushManager' in window;
        const hasNotification = 'Notification' in window;
        const hasNavigatorSW = !!navigator.serviceWorker;
        const hasWindowPM = !!window.PushManager;
        const isSecureContext = window.isSecureContext;
        const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

        const isSupported = hasServiceWorker && hasPushManager && hasNotification && hasNavigatorSW && hasWindowPM && (isSecureContext || isLocalhost);

        if (!isSupported) {
            console.log('Push notification support check:', {
                hasServiceWorker,
                hasPushManager,
                hasNotification,
                hasNavigatorSW,
                hasWindowPM,
                isSecureContext,
                isLocalhost,
                protocol: location.protocol,
                hostname: location.hostname,
                isSupported
            });
        }

        return isSupported;
    }

    // Get notification permission
    async getPermission() {
        if (!this.isSupported()) {
            throw new Error('Push notifications are not supported');
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    // Get subscription status
    async getSubscriptionStatus() {
        try {
            if (!this.registration) {
                this.registration = await navigator.serviceWorker.getRegistration();
            }

            if (!this.registration) {
                return { subscribed: false, permission: 'default' };
            }

            const subscription = await this.registration.pushManager.getSubscription();
            const permission = Notification.permission;

            return {
                subscribed: !!subscription,
                permission,
                subscription
            };
        } catch (error) {
            console.error('Error getting subscription status:', error);
            return { subscribed: false, permission: 'default' };
        }
    }

    // Diagnostic method for debugging push notification issues
    async diagnose() {
        console.log('=== Push Notification Diagnostics ===');

        // Check browser support
        const support = this.isSupported();
        console.log('Browser support:', support);

        // Check environment
        console.log('Environment:', {
            protocol: location.protocol,
            hostname: location.hostname,
            isSecureContext: window.isSecureContext,
            userAgent: navigator.userAgent
        });

        // Check VAPID key
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        console.log('VAPID key configured:', !!publicKey);
        if (publicKey) {
            console.log('VAPID key length:', publicKey.length);
        }

        // Check service worker
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            console.log('Service worker registration:', !!registration);
            if (registration) {
                console.log('SW active:', !!registration.active);
                console.log('SW state:', registration.active?.state);
                console.log('SW scope:', registration.scope);
                console.log('PushManager available:', !!registration.pushManager);
            }
        } catch (error) {
            console.log('Service worker error:', error);
        }

        // Check permissions
        console.log('Notification permission:', Notification.permission);

        // Check existing subscription
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration?.pushManager) {
                const existingSub = await registration.pushManager.getSubscription();
                console.log('Existing subscription:', !!existingSub);
                if (existingSub) {
                    console.log('Existing subscription details:', {
                        endpoint: !!existingSub.endpoint,
                        hasKeys: !!existingSub.keys,
                        hasP256dh: !!existingSub.keys?.p256dh,
                        hasAuth: !!existingSub.keys?.auth
                    });
                }
            }
        } catch (error) {
            console.log('Subscription check error:', error);
        }

        console.log('=== End Diagnostics ===');
    }
}

export default new PushNotificationManager();
