import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import PushNotificationManager from '@/utils/pushNotifications';

export default function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permission, setPermission] = useState('default');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const params = useParams();
    const roomId = params?.room_id;

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
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        checkSupport();
    }, []);

    const subscribe = useCallback(async () => {
        // Push notifications via backend — coming soon
        setLoading(false);
    }, []);

    const unsubscribe = useCallback(async () => {
        setLoading(false);
    }, []);

    const checkSubscription = useCallback(async () => false, []);

    const requestPermission = useCallback(async () => {
        if (!isSupported) throw new Error('Push notifications not supported');
        try {
            const granted = await PushNotificationManager.getPermission();
            setPermission(granted ? 'granted' : 'denied');
            return granted;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [isSupported]);

    return { isSupported, isSubscribed, permission, loading, error, subscribe, unsubscribe, checkSubscription, requestPermission };
}
