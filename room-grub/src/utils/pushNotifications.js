import { createClient } from '@/utils/supabase/client';

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

class PushNotificationManager {
    constructor() {
        this.supabase = createClient();
        this.registration = null;
    }

    // Check if push notifications are supported
    isSupported() {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    }

    // Get notification permission
    async getPermission() {
        if (!this.isSupported()) {
            throw new Error('Push notifications are not supported');
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    // Register service worker
    async registerServiceWorker() {
        if (!this.isSupported()) {
            throw new Error('Service workers are not supported');
        }

        try {
            this.registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully');
            return this.registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            throw error;
        }
    }

    // Subscribe to push notifications
    async subscribe(userId, roomId) {
        try {
            if (!this.registration) {
                await this.registerServiceWorker();
            }

            const hasPermission = await this.getPermission();
            if (!hasPermission) {
                throw new Error('Notification permission denied');
            }

            const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicKey) {
                throw new Error('VAPID public key not configured');
            }

            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            // Save subscription to database
            await this.saveSubscription(userId, roomId, subscription);
            
            console.log('Push notification subscription successful');
            return subscription;
        } catch (error) {
            console.error('Push notification subscription failed:', error);
            throw error;
        }
    }

    // Save subscription to database
    async saveSubscription(userId, roomId, subscription) {
        try {
            const { data: session } = await this.supabase.auth.getSession();
            if (!session?.session) {
                throw new Error('User not authenticated');
            }

            const subscriptionData = {
                user_id: userId,
                room_id: roomId,
                endpoint: subscription.endpoint,
                p256dh_key: subscription.keys.p256dh,
                auth_key: subscription.keys.auth
            };

            const { error } = await this.supabase
                .from('push_subscriptions')
                .upsert(subscriptionData, {
                    onConflict: 'user_id,room_id',
                    ignoreDuplicates: false
                });

            if (error) throw error;
            
            console.log('Subscription saved to database');
        } catch (error) {
            console.error('Error saving subscription:', error);
            throw error;
        }
    }

    // Unsubscribe from push notifications
    async unsubscribe(userId, roomId) {
        try {
            if (!this.registration) {
                this.registration = await navigator.serviceWorker.getRegistration();
            }

            if (this.registration) {
                const subscription = await this.registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                }
            }

            // Remove subscription from database
            await this.removeSubscription(userId, roomId);
            
            console.log('Push notification unsubscribed successfully');
        } catch (error) {
            console.error('Push notification unsubscribe failed:', error);
            throw error;
        }
    }

    // Remove subscription from database
    async removeSubscription(userId, roomId) {
        try {
            const { error } = await this.supabase
                .from('push_subscriptions')
                .delete()
                .eq('user_id', userId)
                .eq('room_id', roomId);

            if (error) throw error;
            
            console.log('Subscription removed from database');
        } catch (error) {
            console.error('Error removing subscription:', error);
            throw error;
        }
    }

    // Check if user is subscribed
    async isSubscribed(userId, roomId) {
        try {
            const { data: subscription, error } = await this.supabase
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .eq('room_id', roomId)
                .single();

            return !error && subscription;
        } catch (error) {
            return false;
        }
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
}

export default new PushNotificationManager();