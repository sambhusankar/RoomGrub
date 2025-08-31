import webpush from 'web-push';
import { createClient } from '@/utils/supabase/server';

// VAPID keys for push notifications
// You'll need to generate these keys: https://vapidkeys.com/
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:your-email@example.com';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

class NotificationService {
    constructor() {
        this.supabase = createClient();
    }

    // Create a notification in the database
    async createNotification(roomId, triggeredBy, activityType, title, message, data = null) {
        try {
            const { data: notification, error } = await this.supabase
                .from('notifications')
                .insert([{
                    room_id: roomId,
                    triggered_by: triggeredBy,
                    activity_type: activityType,
                    title,
                    message,
                    data
                }])
                .select()
                .single();

            if (error) throw error;
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Get push subscriptions for room members
    async getRoomPushSubscriptions(roomId, excludeUserId = null) {
        try {
            let query = this.supabase
                .from('push_subscriptions')
                .select('*')
                .eq('room_id', roomId);

            if (excludeUserId) {
                query = query.neq('user_id', excludeUserId);
            }

            const { data: subscriptions, error } = await query;
            if (error) throw error;

            return subscriptions || [];
        } catch (error) {
            console.error('Error getting push subscriptions:', error);
            return [];
        }
    }

    // Send push notification to specific subscriptions
    async sendPushNotifications(subscriptions, payload) {
        if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
            console.warn('VAPID keys not configured. Push notifications will not be sent.');
            return;
        }

        const promises = subscriptions.map(async (subscription) => {
            try {
                const pushSubscription = {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.p256dh_key,
                        auth: subscription.auth_key
                    }
                };

                await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
                console.log('Push notification sent successfully');
            } catch (error) {
                console.error('Error sending push notification:', error);
                
                // If subscription is invalid, remove it
                if (error.statusCode === 410) {
                    await this.removeInvalidSubscription(subscription.id);
                }
            }
        });

        await Promise.allSettled(promises);
    }

    // Remove invalid subscription
    async removeInvalidSubscription(subscriptionId) {
        try {
            await this.supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', subscriptionId);
        } catch (error) {
            console.error('Error removing invalid subscription:', error);
        }
    }

    // Main method to create notification and send push notifications
    async notify(roomId, triggeredBy, activityType, title, message, data = null) {
        try {
            // Create notification in database
            const notification = await this.createNotification(
                roomId, 
                triggeredBy, 
                activityType, 
                title, 
                message, 
                data
            );

            // Get push subscriptions for room members (excluding the user who triggered the action)
            const subscriptions = await this.getRoomPushSubscriptions(roomId, triggeredBy);

            // Send push notifications
            if (subscriptions.length > 0) {
                const payload = {
                    title,
                    body: message,
                    icon: '/icon-192x192.png',
                    badge: '/icon-72x72.png',
                    tag: `room-${roomId}-${activityType}`,
                    data: {
                        roomId,
                        activityType,
                        notificationId: notification.id,
                        ...data
                    },
                    actions: [
                        {
                            action: 'view',
                            title: 'View Room'
                        }
                    ]
                };

                await this.sendPushNotifications(subscriptions, payload);
            }

            return notification;
        } catch (error) {
            console.error('Error in notify method:', error);
            throw error;
        }
    }

    // Convenience methods for different notification types
    async notifyGroceryAdded(roomId, triggeredBy, userName, itemCount) {
        return this.notify(
            roomId,
            triggeredBy,
            'grocery',
            'New Grocery Items Added',
            `${userName} added ${itemCount} item(s) to the grocery list`,
            { itemCount }
        );
    }

    async notifyPaymentSettled(roomId, triggeredBy, userName, amount) {
        return this.notify(
            roomId,
            triggeredBy,
            'payment',
            'Payment Settled',
            `${userName} recorded a payment of ₹${amount}`,
            { amount }
        );
    }

    async notifyContributionMade(roomId, triggeredBy, userName, amount) {
        return this.notify(
            roomId,
            triggeredBy,
            'payment',
            'Contribution Made',
            `${userName} made a contribution of ₹${amount}`,
            { amount, type: 'contribution' }
        );
    }

    async notifyMemberJoined(roomId, triggeredBy, userName) {
        return this.notify(
            roomId,
            triggeredBy,
            'member_join',
            'New Member Joined',
            `${userName} joined the room`,
            { userName }
        );
    }

    async notifyExpenseAdded(roomId, triggeredBy, userName, amount, material) {
        return this.notify(
            roomId,
            triggeredBy,
            'expense',
            'New Expense Added',
            `${userName} added an expense: ${material} (₹${amount})`,
            { amount, material }
        );
    }
}

export default new NotificationService();