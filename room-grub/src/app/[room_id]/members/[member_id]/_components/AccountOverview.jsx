'use client';

import { Card, CardContent, Typography, Box, Stack, Button } from '@mui/joy';
import useUserRole from '@/hooks/useUserRole';

export default function AccountOverview({ 
    summary, 
    member, 
    onSettlePayment, 
    onShowContributionForm,
    isSettling = false 
}) {
    const { role, loadings } = useUserRole();

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
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
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
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Amount Received</Typography>
                        <Typography level="title-lg" sx={{ color: 'primary.500', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                            {formatCurrency(summary.totalReceived)}
                        </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0, p: 2, bgcolor: 'background.level1', borderRadius: 2, boxShadow: 'sm' }}>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Monthly Contributions</Typography>
                        <Typography level="title-lg" sx={{ color: 'warning.500', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                            {formatCurrency(summary.totalContributed)}
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
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    {summary.pendingAmount > 0 && (!loadings && role === 'Admin') && (
                        <Button 
                            variant="solid" 
                            color="success" 
                            onClick={onSettlePayment}
                            loading={isSettling}
                        >
                            Settle Payment ({formatCurrency(summary.pendingAmount)})
                        </Button>
                    )}
                    <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={onShowContributionForm}
                    >
                        Record Monthly Contribution
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}