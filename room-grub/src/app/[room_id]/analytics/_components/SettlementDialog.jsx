'use client';

import React, { useState } from 'react';
import {
    Modal,
    ModalDialog,
    ModalClose,
    Typography,
    Button,
    Box,
    Avatar,
    Alert,
    CircularProgress
} from '@mui/joy';
import { 
    CheckCircle, 
    Warning, 
    TrendingUp, 
    TrendingDown,
    AccountBalance
} from '@mui/icons-material';

export default function SettlementDialog({ 
    open, 
    onClose, 
    member, 
    roomId,
    onSettlementComplete 
}) {
    const [isSettling, setIsSettling] = useState(false);
    const [error, setError] = useState('');

    if (!member) return null;

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(amount));
    };

    const getMemberAvatar = (member) => {
        return member.profile ? (
            <Avatar src={member.profile} size="lg" />
        ) : (
            <Avatar size="lg">
                {(member.name || member.email).charAt(0).toUpperCase()}
            </Avatar>
        );
    };

    const handleSettle = async () => {
        setIsSettling(true);
        setError('');

        try {
            const settlementAmount = Math.abs(member.finalBalance);
            
            // Determine the correct status and amount for balance table
            let status, amount, description;
            
            if (member.status === 'credit') {
                // Member should receive money - record as debit with negative value
                status = 'debit';
                amount = -settlementAmount; // Negative for money going out to member
                description = `Settlement payment to ${member.member.name || member.member.email}`;
            } else {
                // Member should pay money - record as credit with positive value
                status = 'credit';
                amount = settlementAmount; // Positive for money coming in from member
                description = `Settlement received from ${member.member.name || member.member.email}`;
            }

            const formData = new FormData();
            formData.append('amount', amount.toString());
            formData.append('user', member.member.email);
            formData.append('room', roomId);
            formData.append('status', status);
            formData.append('transaction_type', 'settlement');
            formData.append('description', description);

            const response = await fetch('/api/balance', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to record settlement');
            }

            // Settlement successful
            onSettlementComplete?.(member);
            onClose();
            
        } catch (err) {
            setError(err.message || 'Failed to process settlement');
        } finally {
            setIsSettling(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog 
                sx={{ 
                    minWidth: { xs: '90vw', sm: 400 }, 
                    maxWidth: { xs: '95vw', sm: 500 },
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto'
                }}
            >
                <ModalClose />
                
                <Typography level="h4" sx={{ mb: 2 }}>
                    Settle Payment
                </Typography>

                {/* Member Info */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 3, 
                    p: { xs: 1.5, sm: 2 }, 
                    bgcolor: 'background.level1', 
                    borderRadius: 'md' 
                }}>
                    {getMemberAvatar(member.member)}
                    <Box>
                        <Typography level="title-md" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                            {member.member.name || member.member.email}
                        </Typography>
                        <Typography level="body-sm" color="neutral">
                            Member settlement
                        </Typography>
                    </Box>
                </Box>

                {/* Settlement Breakdown */}
                <Box sx={{ 
                    mb: 3, 
                    p: { xs: 1.5, sm: 2 }, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 'md' 
                }}>
                    <Typography level="title-sm" sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Settlement Breakdown
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                        <Typography level="body-sm" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Total Expenses:</Typography>
                        <Typography level="body-sm" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>{formatAmount(member.expenses)}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                        <Typography level="body-sm" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Contributions:</Typography>
                        <Typography level="body-sm" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>{formatAmount(member.contributions)}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                        <Typography level="body-sm" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Already Received:</Typography>
                        <Typography level="body-sm" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>{formatAmount(Math.abs(member.settlements))}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                        <Typography level="body-sm" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Fair Share:</Typography>
                        <Typography level="body-sm" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 500 }}>{formatAmount(member.shouldPay)}</Typography>
                    </Box>
                    
                    <hr style={{ margin: '8px 0', borderColor: 'var(--joy-palette-divider)' }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
                            Settlement Amount:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {member.status === 'credit' ? (
                                <TrendingUp sx={{ color: 'success.600', fontSize: 20 }} />
                            ) : (
                                <TrendingDown sx={{ color: 'warning.600', fontSize: 20 }} />
                            )}
                            <Typography 
                                level="title-md" 
                                sx={{ 
                                    fontWeight: 'bold',
                                    color: member.status === 'credit' ? 'success.600' : 'warning.600'
                                }}
                            >
                                {formatAmount(member.finalBalance)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Settlement Action */}
                <Alert 
                    color={member.status === 'credit' ? 'success' : 'warning'}
                    startDecorator={member.status === 'credit' ? <AccountBalance /> : <Warning />}
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
                            {member.status === 'credit' ? 'Pay Member' : 'Collect from Member'}
                        </Typography>
                        <Typography level="body-sm">
                            {member.status === 'credit' 
                                ? `This member should receive ${formatAmount(member.finalBalance)} from the group.`
                                : `This member should pay ${formatAmount(member.finalBalance)} to the group.`
                            }
                        </Typography>
                    </Box>
                </Alert>

                {/* Error Message */}
                {error && (
                    <Alert color="danger" sx={{ mb: 2 }}>
                        <Typography level="body-sm">{error}</Typography>
                    </Alert>
                )}

                {/* Action Buttons */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 2 }, 
                    justifyContent: 'flex-end',
                    flexDirection: { xs: 'column-reverse', sm: 'row' }
                }}>
                    <Button 
                        variant="outlined" 
                        color="neutral" 
                        onClick={onClose}
                        disabled={isSettling}
                        fullWidth={{ xs: true, sm: false }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        color={member.status === 'credit' ? 'success' : 'warning'}
                        onClick={handleSettle}
                        loading={isSettling}
                        startDecorator={!isSettling && <CheckCircle />}
                        fullWidth={{ xs: true, sm: false }}
                    >
                        {isSettling 
                            ? 'Processing...' 
                            : member.status === 'credit' 
                                ? 'Mark as Paid' 
                                : 'Mark as Collected'
                        }
                    </Button>
                </Box>
            </ModalDialog>
        </Modal>
    );
}