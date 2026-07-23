'use client';

import React from 'react';
import { Box } from '@mui/joy';
import SplitCalculator from './SplitCalculator';

export default function SplitsDashboard({ expenses, members, settlements, roomId, userRole }) {
    return (
        <Box sx={{
            p: { xs: 2, md: 4 },
            bgcolor: '#faf5ff',
            minHeight: '100vh'
        }}>
            <SplitCalculator
                expenses={expenses}
                members={members}
                settlements={settlements}
                roomId={roomId}
                userRole={userRole}
            />
        </Box>
    );
}
