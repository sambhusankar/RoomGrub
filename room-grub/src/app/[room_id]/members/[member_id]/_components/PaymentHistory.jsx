import React from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip } from '@mui/joy';
import { formatCurrency, formatDate } from '@/utils/format';

export default function PaymentHistory({ payments }) {
    return (
        <Box sx={{ flex: 1 }}>
            <Typography level="title-lg" sx={{ mb: 2 }}>Payment History</Typography>
            {payments.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography>No payments found</Typography>
                    </CardContent>
                </Card>
            ) : (
                <Stack spacing={2}>
                    {payments.map((payment) => (
                        <Card key={payment.id} variant="outlined">
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                size="sm"
                                                color={payment.status === 'credit' ? 'success' : 'warning'}
                                            >
                                                {payment.transaction_type === 'purchase_settlement' ? 'Settlement' :
                                                    payment.transaction_type === 'monthly_contribution' ? 'Monthly' :
                                                        payment.status === 'credit' ? 'Received' : 'Contributed'}
                                            </Chip>
                                        </Box>
                                        <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                            {formatDate(payment.created_at)}
                                        </Typography>
                                        {payment.description && (
                                            <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
                                                {payment.description}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography
                                        level="title-md"
                                        sx={{
                                            color: payment.status === 'credit' ? 'success.500' : 'warning.600'
                                        }}
                                    >
                                        {payment.status === 'credit' ? '+' : '-'}{formatCurrency(payment.amount)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    )
}