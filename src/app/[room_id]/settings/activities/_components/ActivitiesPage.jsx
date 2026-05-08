'use client';

import { Box, Typography } from '@mui/joy';
import ActivityList from './ActivityList';

export default function ActivitiesPage({ activities, isAdmin, roomId, emailToName }) {
    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', p: 3 }}>
            <Typography level="h2" sx={{ mb: 4, fontWeight: 700, color: 'text.primary', textAlign: 'center' }}>
                Activity History
            </Typography>
            <ActivityList
                activities={activities}
                isAdmin={isAdmin}
                roomId={roomId}
                userMap={emailToName}
            />
        </Box>
    );
}
