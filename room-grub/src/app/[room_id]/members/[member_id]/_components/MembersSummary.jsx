'use client';
import React from 'react';
import { Button } from '@mui/joy';
import useUserRole from '@/hooks/useUserRole';
import { Card, CardContent, Typography, Stack, Box } from '@mui/joy';
import { formatCurrency } from '@/utils/format';

export default function MembersSummary({ summary, handleSettlePayment, setShowContributionForm }) {
    if (!summary) return null;
    const { role, loadings } = useUserRole();
    
    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography level="title-lg" sx={{ mb: 2 }}>Account Summary</Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Box>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Total Purchases</Typography>
                        <Typography level="title-md" sx={{ color: 'success.500' }}>
                            {formatCurrency(summary.totalPurchases)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Amount Received</Typography>
                        <Typography level="title-md" sx={{ color: 'primary.500' }}>
                            {formatCurrency(summary.totalReceived)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Monthly Contributions</Typography>
                        <Typography level="title-md" sx={{ color: 'warning.500' }}>
                            {formatCurrency(summary.totalContributed)}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Pending Amount</Typography>
                        <Typography level="title-md" sx={{ color: summary.pendingAmount > 0 ? 'danger.500' : 'success.500' }}>
                            {formatCurrency(summary.pendingAmount)}
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    {summary.pendingAmount > 0 && (!loadings && role == 'Admin') && (
                        <Button
                            variant="solid"
                            color="success"
                            onClick={handleSettlePayment}
                        >
                            Settle Payment ({formatCurrency(summary.pendingAmount)})
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setShowContributionForm(true)}
                    >
                        Record Monthly Contribution
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    )
}