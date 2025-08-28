"use client"
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/joy';
import { CheckCircleRounded, ShoppingCartRounded } from '@mui/icons-material';

export default function ExpenseCard({ user, amount, date, material, userProfile, sx }) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { 
            day: 'numeric',
            month: 'short'
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Card
            variant="plain"
            sx={{
                mx: 0,
                mb: 0,
                borderRadius: 0,
                bgcolor: 'background.surface',
                boxShadow: 'none',
                border: 'none',
                '&:hover': {
                    bgcolor: 'background.level1',
                    transition: 'background-color 0.2s ease-in-out',
                },
                ...sx,
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    {/* Transaction Icon/Avatar */}
                    <Box sx={{ position: 'relative' }}>
                        {userProfile ? (
                            <Box
                                component="img"
                                src={userProfile}
                                alt={user}
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    bgcolor: 'background.level1',
                                }}
                                onError={e => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                bgcolor: 'primary.100',
                                display: userProfile ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid',
                                borderColor: 'primary.200',
                            }}
                        >
                            <ShoppingCartRounded sx={{ color: 'primary.600', fontSize: 20 }} />
                        </Box>
                        
                        {/* Success indicator */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -2,
                                right: -2,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: 'background.surface',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <CheckCircleRounded sx={{ color: 'success.500', fontSize: 14 }} />
                        </Box>
                    </Box>

                    {/* Transaction Details */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Primary info - User and amount */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                            <Typography 
                                level="title-sm" 
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    lineHeight: 1.3,
                                }}
                            >
                                {user}
                            </Typography>
                            <Typography 
                                level="title-sm" 
                                sx={{ 
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    ml: 2,
                                    flexShrink: 0,
                                }}
                            >
                                {formatAmount(amount)}
                            </Typography>
                        </Box>

                        {/* Secondary info - Material and category */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography 
                                level="body-sm" 
                                sx={{ 
                                    color: 'text.tertiary',
                                    fontWeight: 500,
                                }}
                            >
                                {material}
                            </Typography>
                            <Typography 
                                level="body-sm" 
                                sx={{ 
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                }}
                            >
                                {formatDate(date)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}