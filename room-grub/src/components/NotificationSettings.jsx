'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Button, Typography, Switch, Alert, Box } from '@mui/joy';
import { Notifications, NotificationsOff } from '@mui/icons-material';
import usePushNotifications from '@/hooks/usePushNotifications';

export default function NotificationSettings() {
    const {
        isSupported,
        isSubscribed,
        permission,
        loading,
        error,
        subscribe,
        unsubscribe,
        requestPermission
    } = usePushNotifications();

    const [localLoading, setLocalLoading] = useState(false);

    const handleToggleNotifications = async () => {
        setLocalLoading(true);
        try {
            if (isSubscribed) {
                await unsubscribe();
            } else {
                if (permission !== 'granted') {
                    await requestPermission();
                }
                await subscribe();
            }
        } catch (err) {
            console.error('Error toggling notifications:', err);
        } finally {
            setLocalLoading(false);
        }
    };

    if (!isSupported) {
        return (
            <Card>
                <CardContent>
                    <Typography level="title-md" startDecorator={<NotificationsOff />}>
                        Push Notifications
                    </Typography>
                    <Alert color="warning" sx={{ mt: 2 }}>
                        Push notifications are not supported in this browser.
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Typography level="title-md">Loading notification settings...</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography 
                    level="title-md" 
                    startDecorator={<Notifications />}
                    sx={{ mb: 2 }}
                >
                    Push Notifications
                </Typography>
                
                <Typography level="body-sm" sx={{ mb: 2 }}>
                    Get notified when room members add groceries, make payments, or join the room.
                </Typography>

                {error && (
                    <Alert color="danger" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {permission === 'denied' && (
                    <Alert color="warning" sx={{ mb: 2 }}>
                        Notifications are blocked. Please enable them in your browser settings to receive push notifications.
                    </Alert>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Switch
                            checked={isSubscribed}
                            onChange={handleToggleNotifications}
                            disabled={localLoading || loading || permission === 'denied'}
                        />
                        <Typography level="body-md">
                            {isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
                        </Typography>
                    </Box>
                    
                    {!isSubscribed && permission !== 'denied' && (
                        <Button
                            variant="soft"
                            color="primary"
                            onClick={handleToggleNotifications}
                            loading={localLoading || loading}
                            startDecorator={<Notifications />}
                            size="sm"
                        >
                            Enable
                        </Button>
                    )}
                </Box>

                <Typography level="body-xs" sx={{ mt: 1, opacity: 0.7 }}>
                    You can disable notifications at any time from this page or your browser settings.
                </Typography>
            </CardContent>
        </Card>
    );
}