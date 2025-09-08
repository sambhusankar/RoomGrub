'use server';
import webpush from 'web-push';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// VAPID keys for push notifications
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:your-email@example.com';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function POST(request) {
    console.log('Received notification request');
    try {
        const { roomId, triggeredBy, activityType, title, message, data } = await request.json();
        
        if (!roomId || !activityType || !title || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Create notification in database
        const { data: notification, error: notificationError } = await supabase
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

        if (notificationError) {
            console.error('Error creating notification:', notificationError);
            return NextResponse.json(
                { error: 'Failed to create notification' },
                { status: 500 }
            );
        }

        // Get push subscriptions for room members (excluding the user who triggered the action)
        let subscriptionQuery = supabase
            .from('push_subscriptions')
            .select('*')
            .eq('room_id', roomId);

        if (triggeredBy) {
            subscriptionQuery = subscriptionQuery.neq('user_id', triggeredBy);
        }

        const { data: subscriptions, error: subscriptionError } = await subscriptionQuery;

        if (subscriptionError) {
            console.error('Error getting push subscriptions:', subscriptionError);
            // Continue without push notifications
        }

        // Send push notifications
        if (subscriptions && subscriptions.length > 0 && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
            const payload = {
                title,
                body: message,
                icon: '/icons/logo-192.png',
                badge: '/icons/logo-72.png',
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
                        title: 'View Room',
                        icon: '/icons/logo-48.png'
                    }
                ]
            };

            // Send notifications to all subscriptions
            const pushPromises = subscriptions.map(async (subscription) => {
                try {
                    const pushSubscription = {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.p256dh_key,
                            auth: subscription.auth_key
                        }
                    };

                    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
                    console.log('Push notification sent successfully to user:', subscription.user_id);
                } catch (error) {
                    console.error('Error sending push notification:', error);
                    
                    // If subscription is invalid (410 status), remove it
                    if (error.statusCode === 410) {
                        try {
                            await supabase
                                .from('push_subscriptions')
                                .delete()
                                .eq('id', subscription.id);
                            console.log('Removed invalid subscription:', subscription.id);
                        } catch (deleteError) {
                            console.error('Error removing invalid subscription:', deleteError);
                        }
                    }
                }
            });

            await Promise.allSettled(pushPromises);
        }

        return NextResponse.json({
            success: true,
            notification,
            pushNotificationsSent: subscriptions ? subscriptions.length : 0
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}