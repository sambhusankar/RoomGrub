'use client';

import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    Button, 
    Typography, 
    IconButton, 
    Alert,
    Box 
} from '@mui/joy';
import { 
    Notifications, 
    NotificationsOff, 
    Close 
} from '@mui/icons-material';
import usePushNotifications from '@/hooks/usePushNotifications';

export default function NotificationPrompt() {
    const {
        isSupported,
        isSubscribed,
        permission,
        loading,
        error,
        subscribe,
        requestPermission
    } = usePushNotifications();

    const [isDismissed, setIsDismissed] = useState(false);
    const [isPrompting, setIsPrompting] = useState(false);

    // Check if we should show the prompt
    useEffect(() => {
        // Don't show if dismissed in this session
        if (isDismissed) return;
        
        // Don't show if not supported
        if (!isSupported) return;
        
        // Don't show if already subscribed
        if (isSubscribed) return;
        
        // Don't show if permission already denied
        if (permission === 'denied') return;
        
        // Check localStorage to see if user has permanently dismissed
        const permanentlyDismissed = localStorage.getItem('notification-prompt-dismissed');
        if (permanentlyDismissed === 'true') {
            setIsDismissed(true);
        }
    }, [isSupported, isSubscribed, permission, isDismissed]);

    const handleEnableNotifications = async () => {
        setIsPrompting(true);
        try {
            if (permission !== 'granted') {
                const granted = await requestPermission();
                if (!granted) {
                    setIsPrompting(false);
                    return;
                }
            }
            await subscribe();
            setIsDismissed(true);
        } catch (err) {
            console.error('Error enabling notifications:', err);
        } finally {
            setIsPrompting(false);
        }
    };

    const handleDismiss = () => {
        setIsDismissed(true);
    };

    const handleDismissPermanently = () => {
        localStorage.setItem('notification-prompt-dismissed', 'true');
        setIsDismissed(true);
    };

    // Don't render if conditions aren't met
    if (loading || isDismissed || !isSupported || isSubscribed || permission === 'denied') {
        return null;
    }

    return (
        <Card 
            variant="soft" 
            color="primary"
            sx={{ 
                mx: 3, 
                mb: 3,
                position: 'relative',
                background: 'linear-gradient(45deg, rgba(0, 123, 255, 0.1), rgba(0, 123, 255, 0.05))',
                border: '1px solid rgba(0, 123, 255, 0.2)'
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Notifications 
                        sx={{ 
                            color: 'primary.500', 
                            fontSize: '2rem',
                            mt: 0.5,
                            flexShrink: 0
                        }} 
                    />
                    
                    <Box sx={{ flex: 1 }}>
                        <Typography 
                            level="title-md" 
                            sx={{ mb: 1, fontWeight: 600 }}
                        >
                            Stay Updated with Room Activity
                        </Typography>
                        
                        <Typography 
                            level="body-sm" 
                            sx={{ mb: 2, opacity: 0.8 }}
                        >
                            Get instant notifications when roommates add groceries, make payments, or join your room. Never miss important updates!
                        </Typography>

                        {error && (
                            <Alert color="warning" size="sm" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 1.5, 
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        }}>
                            <Button
                                variant="solid"
                                color="primary"
                                onClick={handleEnableNotifications}
                                loading={isPrompting}
                                startDecorator={<Notifications />}
                                sx={{ minWidth: '140px' }}
                            >
                                Enable Notifications
                            </Button>
                            
                            <Button
                                variant="plain"
                                color="neutral"
                                size="sm"
                                onClick={handleDismiss}
                                sx={{ 
                                    fontSize: '0.75rem',
                                    minHeight: '28px',
                                    opacity: 0.7,
                                    '&:hover': { opacity: 1 }
                                }}
                            >
                                Maybe later
                            </Button>
                            
                            <Button
                                variant="plain"
                                color="neutral"
                                size="sm"
                                onClick={handleDismissPermanently}
                                sx={{ 
                                    fontSize: '0.75rem',
                                    minHeight: '28px',
                                    opacity: 0.7,
                                    '&:hover': { opacity: 1 }
                                }}
                            >
                                Don't ask again
                            </Button>
                        </Box>
                    </Box>
                    
                    <IconButton
                        variant="plain"
                        color="neutral"
                        size="sm"
                        onClick={handleDismiss}
                        sx={{ 
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            opacity: 0.5,
                            '&:hover': { opacity: 1 }
                        }}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            </CardContent>
        </Card>
    );
}