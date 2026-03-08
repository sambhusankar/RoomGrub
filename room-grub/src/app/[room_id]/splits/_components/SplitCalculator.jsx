'use client';

import React, { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Button,
    Avatar,
    Alert
} from '@mui/joy';
import {
    TrendingUp,
    TrendingDown,
    Calculate,
    CheckCircle,
    Payment,
    Receipt
} from '@mui/icons-material';
import { settleAllPending } from '../actions';
import { useRouter } from 'next/navigation';

export default function SplitCalculator({ expenses, payments, members, filters, roomId, userRole }) {
    const router = useRouter();
    const [isSettling, setIsSettling] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Calculate the smart split for the current period
    const splitCalculation = useMemo(() => {
        // Determine which members to include based on filter
        const activeMembers = filters.selectedMembers.length > 0
            ? members.filter(m => filters.selectedMembers.includes(m.email))
            : members;

        // Calculate expenses and settlements for each member
        const memberExpenses = {};
        const memberSettlements = {}; // Debit transactions (received)

        // Initialize member data only for active members
        activeMembers.forEach(member => {
            memberExpenses[member.email] = 0;
            memberSettlements[member.email] = 0;
        });

        // Sum up expenses per member
        expenses.forEach(expense => {
            if (memberExpenses.hasOwnProperty(expense.user)) {
                memberExpenses[expense.user] += parseFloat(expense.money || 0);
            }
        });

        // Sum up settlements received (debit transactions with negative amounts)
        payments.forEach(payment => {
            if (memberSettlements.hasOwnProperty(payment.user)) {
                if (payment.status === 'debit') {
                    // Debit amounts are negative, add them directly
                    memberSettlements[payment.user] += parseFloat(payment.amount || 0);
                }
            }
        });

        // Calculate pending expenses for each member
        // Pending = Expenses + Settlements (settlements are negative, so this subtracts)
        const memberPending = {};
        activeMembers.forEach(member => {
            memberPending[member.email] = memberExpenses[member.email] + memberSettlements[member.email];
        });

        // Calculate total pending expenses (only positive pending amounts)
        const totalPendingExpenses = Object.values(memberPending).reduce((sum, amount) => {
            return sum + (amount > 0 ? amount : 0);
        }, 0);

        const numberOfMembers = activeMembers.length;
        const equalShare = totalPendingExpenses / numberOfMembers;

        // Calculate balances
        const memberBalances = [];
        activeMembers.forEach(member => {
            const spent = memberExpenses[member.email];
            const pendingAmount = memberPending[member.email];
            const shouldPay = equalShare;
            const balance = pendingAmount - shouldPay; // Positive means they should get money back, negative means they owe

            memberBalances.push({
                member,
                spent,
                pendingAmount,
                shouldPay,
                balance,
                status: balance > 0 ? 'credit' : balance < 0 ? 'debit' : 'even'
            });
        });

        // Count pending settlements
        const pendingSettlements = memberBalances.filter(mb => Math.abs(mb.balance) > 0.01);

        return {
            totalPendingExpenses,
            equalShare,
            memberBalances,
            numberOfMembers,
            pendingSettlements
        };
    }, [expenses, payments, members, filters.selectedMembers]);

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
            <Avatar src={member.profile} size="md" />
        ) : (
            <Avatar size="md">
                {(member.name || member.email).charAt(0).toUpperCase()}
            </Avatar>
        );
    };

    const handleSettleAll = async () => {
        setIsSettling(true);
        setError('');
        setSuccess('');

        try {
            const result = await settleAllPending(roomId, splitCalculation.memberBalances);

            if (!result.success) {
                throw new Error(result.error || 'Failed to settle all balances');
            }

            setSuccess(`Successfully settled ${result.settledCount} member${result.settledCount !== 1 ? 's' : ''}!`);

            // Refresh the page to show updated data
            setTimeout(() => {
                router.refresh();
            }, 1500);

        } catch (err) {
            setError(err.message || 'Failed to process settlement');
        } finally {
            setIsSettling(false);
        }
    };

    return (
        <Box>
            {/* Summary Cards - Mobile Optimized 2 Column Grid */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1.5,
                mb: 2
            }}>
                {/* Total Pending */}
                <Card
                    variant="soft"
                    color="primary"
                    sx={{ p: 1.5 }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Calculate sx={{ fontSize: 18 }} />
                        <Typography level="body-xs" sx={{ fontWeight: 500 }}>
                            Total Pending
                        </Typography>
                    </Box>
                    <Typography level="h4" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                        {formatAmount(splitCalculation.totalPendingExpenses)}
                    </Typography>
                </Card>

                {/* Per Person */}
                <Card
                    variant="soft"
                    color="success"
                    sx={{ p: 1.5 }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Receipt sx={{ fontSize: 18 }} />
                        <Typography level="body-xs" sx={{ fontWeight: 500 }}>
                            Per Person
                        </Typography>
                    </Box>
                    <Typography level="h4" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                        {formatAmount(splitCalculation.equalShare)}
                    </Typography>
                </Card>
            </Box>

            {/* Success Message */}
            {success && (
                <Alert
                    color="success"
                    startDecorator={<CheckCircle />}
                    sx={{ mb: 2, borderRadius: 'md' }}
                >
                    <Typography level="body-sm">{success}</Typography>
                </Alert>
            )}

            {/* Error Message */}
            {error && (
                <Alert color="danger" sx={{ mb: 2, borderRadius: 'md' }}>
                    <Typography level="body-sm">{error}</Typography>
                </Alert>
            )}

            {/* All Settled Message - Show when no pending settlements */}
            {splitCalculation.pendingSettlements.length === 0 ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 8,
                        px: 3,
                        textAlign: 'center'
                    }}
                >
                    <CheckCircle
                        sx={{
                            fontSize: 80,
                            color: 'success.500',
                            mb: 2,
                            opacity: 0.9
                        }}
                    />
                    <Typography
                        level="h3"
                        sx={{
                            fontWeight: 'bold',
                            mb: 1,
                            color: 'success.700'
                        }}
                    >
                        All Clear!
                    </Typography>
                    <Typography
                        level="body-md"
                        sx={{
                            color: 'text.secondary',
                            maxWidth: 300
                        }}
                    >
                        No pending expenses to settle. Everyone is even!
                    </Typography>
                </Box>
            ) : (
                /* Member Balances List - Mobile Card Layout - Show only when there are pending settlements */
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                    {splitCalculation.memberBalances.map((memberBalance) => (
                        <Card
                            key={memberBalance.member.email}
                            variant="soft"
                            color={
                                memberBalance.status === 'credit' ? 'success' :
                                memberBalance.status === 'debit' ? 'danger' : 'neutral'
                            }
                            sx={{
                                borderRadius: 'md',
                                p: 2
                            }}
                        >
                            {/* Member Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                {getMemberAvatar(memberBalance.member)}
                                <Box sx={{ flex: 1 }}>
                                    <Typography level="title-md" sx={{ fontWeight: 600 }}>
                                        {memberBalance.member.name || memberBalance.member.email}
                                    </Typography>
                                    <Typography level="body-xs" color="neutral">
                                        Pending: {formatAmount(memberBalance.pendingAmount)}
                                    </Typography>
                                </Box>
                                {/* Balance Amount - Prominent */}
                                <Box sx={{ textAlign: 'right' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mb: 0.5 }}>
                                        {memberBalance.status === 'credit' ? (
                                            <TrendingUp sx={{ fontSize: 20 }} />
                                        ) : memberBalance.status === 'debit' ? (
                                            <TrendingDown sx={{ fontSize: 20 }} />
                                        ) : (
                                            <CheckCircle sx={{ fontSize: 20 }} />
                                        )}
                                    </Box>
                                    <Typography
                                        level="h4"
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: '1.25rem'
                                        }}
                                    >
                                        {memberBalance.status === 'even' ? '₹0' : formatAmount(memberBalance.balance)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Settle All Button - Full Width at Bottom - Admin Only */}
            {splitCalculation.pendingSettlements.length > 0 && userRole === 'Admin' && (
                <Button
                    fullWidth
                    color="success"
                    size="lg"
                    onClick={handleSettleAll}
                    loading={isSettling}
                    startDecorator={!isSettling && <Payment />}
                    disabled={isSettling}
                    sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 'md',
                        textTransform: 'none'
                    }}
                >
                    {isSettling
                        ? 'Settling...'
                        : `Settle All (${splitCalculation.pendingSettlements.length})`
                    }
                </Button>
            )}
        </Box>
    );
}
