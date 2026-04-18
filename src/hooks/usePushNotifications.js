import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import PushNotificationManager from '@/utils/pushNotifications';

export default function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState('default');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const params = useParams();
    const supabase = createClient();
    const roomId = params?.room_id;

    // Check support and initial status
    useEffect(() => {
        const checkSupport = async () => {
            try {
                const supported = PushNotificationManager.isSupported();
                setIsSupported(supported);
                
                if (supported) {
                    const status = await PushNotificationManager.getSubscriptionStatus();
                    setIsSubscribed(status.subscribed);
                    setPermission(status.permission);
                }
            } catch (err) {
                console.error('Error checking push notification support:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        checkSupport();
    }, []);

    // Subscribe to push notifications
    const subscribe = useCallback(async () => {
        if (!isSupported || !roomId) {
            throw new Error('Push notifications not supported or room ID missing');
        }

        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                throw new Error('User not authenticated');
            }

            // Get user ID from database
            const { data: userData } = await supabase
                .from('Users')
                .select('id')
                .eq('email', session.user.email)
                .single();

            if (!userData) {
                throw new Error('User not found in database');
            }

            await PushNotificationManager.subscribe(userData.id, parseInt(roomId));
            
            setIsSubscribed(true);
            setPermission('granted');
            
            console.log('Successfully subscribed to push notifications');
        } catch (err) {
            console.error('Error subscribing to push notifications:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [isSupported, roomId, supabase]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        if (!isSupported || !roomId) {
            throw new Error('Push notifications not supported or room ID missing');
        }

        setLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                throw new Error('User not authenticated');
            }

            // Get user ID from database
            const { data: userData } = await supabase
                .from('Users')
                .select('id')
                .eq('email', session.user.email)
                .single();

            if (!userData) {
                throw new Error('User not found in database');
            }

            await PushNotificationManager.unsubscribe(userData.id, parseInt(roomId));
            
            setIsSubscribed(false);
            
            console.log('Successfully unsubscribed from push notifications');
        } catch (err) {
            console.error('Error unsubscribing from push notifications:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [isSupported, roomId, supabase]);

    // Check if user is subscribed for this room
    const checkSubscription = useCallback(async () => {
        if (!isSupported || !roomId) {
            return false;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                return false;
            }

            // Get user ID from database
            const { data: userData } = await supabase
                .from('Users')
                .select('id')
                .eq('email', session.user.email)
                .single();

            if (!userData) {
                return false;
            }

            const subscribed = await PushNotificationManager.isSubscribed(userData.id, parseInt(roomId));
            setIsSubscribed(subscribed);
            return subscribed;
        } catch (err) {
            console.error('Error checking subscription:', err);
            return false;
        }
    }, [isSupported, roomId, supabase]);

    // Request permission
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            throw new Error('Push notifications not supported');
        }

        try {
            const granted = await PushNotificationManager.getPermission();
            setPermission(granted ? 'granted' : 'denied');
            return granted;
        } catch (err) {
            console.error('Error requesting permission:', err);
            setError(err.message);
            throw err;
        }
    }, [isSupported]);

    return {
        isSupported,
        isSubscribed,
        permission,
        loading,
        error,
        subscribe,
        unsubscribe,
        checkSubscription,
        requestPermission
    };
}