'use client';

import { Box, Card, CardContent, Typography } from '@mui/joy';
import MembersList from '../admin/_components/MembersList';

export default function HomeDashboard({ totalRoomStats, memberStats }) {
    const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

    return (
        <Box>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography level="title-lg" sx={{ mb: 2 }}>Room Overview</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                        <Box sx={{ p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Purchases</Typography>
                            <Typography level="title-lg" sx={{ color: 'success.500' }}>
                                {formatCurrency(totalRoomStats.totalPurchases)}
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Pending Payments</Typography>
                            <Typography level="title-lg" sx={{ color: 'danger.500' }}>
                                {formatCurrency(totalRoomStats.pendingPayments)}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <MembersList memberStats={memberStats} />
        </Box>
    );
}
