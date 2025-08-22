'use client';

import { Card, CardContent, Typography, Box } from '@mui/joy';

export default function RoomOverview({ totalRoomStats }) {
    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography level="title-lg" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Room Overview
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                        gap: 2,
                        width: '100%',
                    }}
                >
                    <Box sx={{ minWidth: 0, p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Purchases</Typography>
                        <Typography level="title-lg" sx={{ color: 'success.500', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                            {formatCurrency(totalRoomStats.totalPurchases)}
                        </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0, p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Paid Out</Typography>
                        <Typography level="title-lg" sx={{ color: 'primary.500', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                            {formatCurrency(totalRoomStats.totalPaid)}
                        </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0, p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Contributions</Typography>
                        <Typography level="title-lg" sx={{ color: 'warning.500', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                            {formatCurrency(totalRoomStats.totalContributions)}
                        </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0, p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Pending Payments</Typography>
                        <Typography level="title-lg" sx={{ color: 'danger.500', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                            {formatCurrency(totalRoomStats.pendingPayments)}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}