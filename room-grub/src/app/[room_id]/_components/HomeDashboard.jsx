'use client';

import { Box, Card, CardContent, Typography } from '@mui/joy';
import MembersList from './MembersList';

export default function HomeDashboard({ totalRoomStats, memberStats }) {
    const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

    return (
        <Box>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography level="title-lg" sx={{ mb: 2 }}>Room Overview</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                        <Box sx={{ p: 2, bgcolor: '#f3fbf6', borderRadius: 'xl', boxShadow: 'sm' }}>
                            <Typography level="body-sm" sx={{ color: '#166534' }}>Total Purchases</Typography>
                            <Typography level="title-lg" sx={{ color: '#16a34a', fontWeight: 700 }}>
                                {formatCurrency(totalRoomStats.totalPurchases)}
                            </Typography>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: '#fdf3f3', borderRadius: 'xl', boxShadow: 'sm' }}>
                            <Typography level="body-sm" sx={{ color: '#991b1b' }}>Pending Payments</Typography>
                            <Typography level="title-lg" sx={{ color: '#dc2626', fontWeight: 700 }}>
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
