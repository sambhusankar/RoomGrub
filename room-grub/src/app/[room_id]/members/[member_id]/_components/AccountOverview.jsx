'use client';

import { Card, CardContent, Typography, Box } from '@mui/joy';

export default function AccountOverview({
    summary,
    member,
}) {

    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography level="title-lg" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Account Overview
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' },
                        gap: 2,
                        width: '100%',
                    }}
                >
                    <Box sx={{ minWidth: 0, p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Purchases</Typography>
                        <Typography level="title-lg" sx={{ color: 'success.500', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                            {formatCurrency(summary.totalPurchases)}
                        </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0, p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Pending Amount</Typography>
                        <Typography level="title-lg" sx={{
                            color: summary.pendingAmount > 0 ? 'danger.500' : 'success.500',
                            fontSize: { xs: '1.1rem', sm: '1.5rem' }
                        }}>
                            {formatCurrency(summary.pendingAmount)}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}