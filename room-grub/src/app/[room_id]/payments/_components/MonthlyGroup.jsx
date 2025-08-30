'use client';

import React from 'react';
import { Box, Typography } from '@mui/joy';
import PaymentCard from './PaymentCard';

export default function MonthlyGroup({ group }) {
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Box sx={{ mb: 3 }}>
            {/* Month Header */}
            <Box sx={{ 
                px: 2,
                py: 2,
                bgcolor: 'background.surface',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 1,
                }}>
                    <Typography 
                        level="title-md" 
                        sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                        }}
                    >
                        {group.monthName}
                    </Typography>
                    <Typography 
                        level="title-sm" 
                        sx={{ 
                            fontWeight: 700,
                            color: group.runningBalance >= 0 ? 'success.600' : 'warning.600',
                        }}
                    >
                        {formatAmount(group.runningBalance)}
                    </Typography>
                </Box>
                
                {/* Monthly Summary */}
                <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                }}>
                    <Typography 
                        level="body-xs" 
                        sx={{ 
                            color: 'text.tertiary',
                            fontSize: '0.75rem',
                        }}
                    >
                        {formatAmount(group.runningBalance - group.monthlyNet)} +
                    </Typography>
                    <Typography 
                        level="body-xs" 
                        sx={{ 
                            color: 'success.600',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                        }}
                    >
                        {formatAmount(group.moneyIn)}
                    </Typography>
                    <Typography 
                        level="body-xs" 
                        sx={{ 
                            color: 'text.tertiary',
                            fontSize: '0.75rem',
                        }}
                    >
                        -
                    </Typography>
                    <Typography 
                        level="body-xs" 
                        sx={{ 
                            color: 'warning.600',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                        }}
                    >
                        {formatAmount(group.moneyOut)}
                    </Typography>
                    <Typography 
                        level="body-xs" 
                        sx={{ 
                            color: 'text.tertiary',
                            fontSize: '0.75rem',
                        }}
                    >
                        =
                    </Typography>
                    <Typography 
                        level="body-xs" 
                        sx={{ 
                            color: group.runningBalance >= 0 ? 'success.600' : 'warning.600',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                        }}
                    >
                        {formatAmount(group.runningBalance)}
                    </Typography>
                </Box>
            </Box>

            {/* Month's Payments */}
            <Box sx={{ bgcolor: 'background.surface' }}>
                {group.payments.map((payment, index) => (
                    <Box key={payment.id}>
                        <PaymentCard
                            user={payment.Users?.name || payment.user || 'Unknown User'}
                            amount={parseFloat(payment.amount)}
                            date={payment.created_at}
                            userProfile={payment.Users?.profile}
                            status={payment.status}
                            sx={{ 
                                mx: 0,
                                my: 0,
                                boxShadow: 'none',
                                border: 'none',
                                bgcolor: 'transparent',
                                borderRadius: 0,
                                '&:hover': {
                                    bgcolor: 'background.level1',
                                },
                            }}
                        />
                        {index < group.payments.length - 1 && (
                            <Box sx={{ 
                                height: 1, 
                                bgcolor: 'divider',
                                mx: 2,
                                opacity: 0.3,
                            }} />
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}