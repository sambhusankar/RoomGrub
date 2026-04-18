'use client';

import React from 'react';
import { Box, Typography } from '@mui/joy';
import NotificationSettings from '@/components/NotificationSettings';

export default function SettingsLayout({ children }) {
    return (
        <Box sx={{ 
            bgcolor: '#f8f9fa', 
            minHeight: '100vh',
            p: 3,
        }}>
            <Typography 
                level="h2" 
                sx={{ 
                    mb: 4,
                    fontWeight: 700,
                    color: 'text.primary',
                    textAlign: 'center'
                }}
            >
                Room Settings
            </Typography>
            
            <Box sx={{ 
                maxWidth: '800px', 
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 3
            }}>
                {/* Notification Settings */}
                <NotificationSettings />
                
                {/* Other Settings (Month component, etc.) */}
                {children}
            </Box>
        </Box>
    );
}