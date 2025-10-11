'use client';

import React, { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Grid,
    Avatar,
    LinearProgress,
    Chip,
    Alert,
    Button
} from '@mui/joy';
import {
    Receipt,
    AccountBalance,
    TrendingUp,
    TrendingDown,
    Warning,
    CheckCircle,
    Person,
    Calculate,
    Payment
} from '@mui/icons-material';
import SettlementDialog from './SettlementDialog';
import useUserRole from '@/hooks/useUserRole';
import { useRouter } from 'next/navigation';

export default function AnalyticsOverview({ expenses, payments, members, filters, roomId }) {
    const { role } = useUserRole();
    const router = useRouter();
    const [selectedMember, setSelectedMember] = useState(null);
    const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);

    // Calculate overview metrics
    const overviewData = useMemo(() => {
        // Basic calculations
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.money || 0), 0);
        const totalTransactions = expenses.length;
        
        // Calculate member expenses and balance table transactions
        const memberStats = {};
        members.forEach(member => {
            memberStats[member.email] = {
                member,
                expenses: 0, // How much they purchased/spent
                contributions: 0, // Money they paid to room (credit status)
                settlements: 0, // Money they received from room (debit with negative amount)
                expenseCount: 0,
                contributionCount: 0,
                settlementCount: 0
            };
        });

        // Process expenses (Spendings table)
        expenses.forEach(expense => {
            if (memberStats[expense.user]) {
                memberStats[expense.user].expenses += parseFloat(expense.money || 0);
                memberStats[expense.user].expenseCount += 1;
            }
        });

        // Process balance table transactions
        payments.forEach(payment => {
            if (memberStats[payment.user]) {
                const amount = parseFloat(payment.amount || 0);
                
                if (payment.status === 'credit') {
                    // Money contributed to the room (positive amount)
                    memberStats[payment.user].contributions += amount;
                    memberStats[payment.user].contributionCount += 1;
                } else if (payment.status === 'debit') {
                    // Money received from room (negative amount) - add the negative amount
                    memberStats[payment.user].settlements += amount; // This will be negative
                    memberStats[payment.user].settlementCount += 1;
                }
            }
        });

        // Calculate splits and pending balances
        const numberOfMembers = members.length;
        const equalShare = totalExpenses / numberOfMembers;

        const memberBalances = Object.values(memberStats).map(stat => {
            // Your formula: Final Balance = Equal Share - Expenses - Contributions - Settlements
            // Note: settlements are stored as negative values (debit), so we subtract them
            // Negative result = Member should receive money
            // Positive result = Member should pay money
            const finalBalance = equalShare - stat.expenses - stat.contributions - stat.settlements;
            
            return {
                ...stat,
                shouldPay: equalShare,
                finalBalance, // What they should receive (-) or pay (+)
                status: finalBalance < 0 ? 'credit' : // Should receive money
                        finalBalance > 0 ? 'debit' :  // Should pay money
                        'even' // All settled
            };
        });

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentExpenses = expenses.filter(exp => 
            new Date(exp.created_at) >= sevenDaysAgo
        );
        const recentPayments = payments.filter(pay => 
            new Date(pay.created_at) >= sevenDaysAgo
        );

        // Top spenders
        const topSpenders = memberBalances
            .filter(mb => mb.expenses > 0)
            .sort((a, b) => b.expenses - a.expenses)
            .slice(0, 3);

        // Pending settlements (members who still owe or should receive money)
        const pendingSettlements = memberBalances.filter(mb => Math.abs(mb.finalBalance) > 0.01);

        return {
            totalExpenses,
            totalTransactions,
            totalContributions: memberBalances.reduce((sum, mb) => sum + mb.contributions, 0),
            totalSettlements: Math.abs(memberBalances.reduce((sum, mb) => sum + mb.settlements, 0)), // Show as positive
            equalShare,
            memberBalances,
            topSpenders,
            pendingSettlements,
            recentActivity: {
                expenses: recentExpenses.length,
                payments: recentPayments.length,
                totalRecentSpending: recentExpenses.reduce((sum, exp) => sum + parseFloat(exp.money || 0), 0)
            },
            averagePerTransaction: totalTransactions > 0 ? totalExpenses / totalTransactions : 0,
            activeMembers: memberBalances.filter(mb => mb.expenses > 0).length
        };
    }, [expenses, payments, members]);

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
            <Avatar src={member.profile} size="sm" />
        ) : (
            <Avatar size="sm">
                {(member.name || member.email).charAt(0).toUpperCase()}
            </Avatar>
        );
    };

    const handleSettleClick = (memberData) => {
        setSelectedMember(memberData);
        setSettlementDialogOpen(true);
    };

    const handleSettlementComplete = () => {
        // Refresh the page to show updated data
        router.refresh();
    };

    return (
        <Box>
            {/* Key Metrics Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid xs={12} sm={6} md={3}>
                    <Card variant="soft" color="primary">
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Receipt color="primary" />
                                <Typography level="body-sm">Total Expenses</Typography>
                            </Box>
                            <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                                {formatAmount(overviewData.totalExpenses)}
                            </Typography>
                            <Typography level="body-xs" color="neutral">
                                {overviewData.totalTransactions} transaction{overviewData.totalTransactions !== 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    <Card variant="soft" color="success">
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Calculate color="success" />
                                <Typography level="body-sm">Per Member Share</Typography>
                            </Box>
                            <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                                {formatAmount(overviewData.equalShare)}
                            </Typography>
                            <Typography level="body-xs" color="neutral">
                                Equal split amount
                            </Typography>
                        </Box>
                    </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    <Card variant="soft" color="warning">
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Warning color="warning" />
                                <Typography level="body-sm">Pending Settlements</Typography>
                            </Box>
                            <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                                {overviewData.pendingSettlements.length}
                            </Typography>
                            <Typography level="body-xs" color="neutral">
                                Member{overviewData.pendingSettlements.length !== 1 ? 's' : ''} to settle
                            </Typography>
                        </Box>
                    </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    <Card variant="soft" color="neutral">
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AccountBalance color="primary" />
                                <Typography level="body-sm">Total Contributions</Typography>
                            </Box>
                            <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                                {formatAmount(overviewData.totalContributions)}
                            </Typography>
                            <Typography level="body-xs" color="neutral">
                                Money paid to room
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Activity Alert */}
            {overviewData.recentActivity.expenses > 0 || overviewData.recentActivity.payments > 0 ? (
                <Alert 
                    color="primary" 
                    startDecorator={<TrendingUp />}
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
                            Recent Activity (Last 7 Days)
                        </Typography>
                        <Typography level="body-sm">
                            {overviewData.recentActivity.expenses} new expense{overviewData.recentActivity.expenses !== 1 ? 's' : ''} 
                            {overviewData.recentActivity.totalRecentSpending > 0 && 
                                ` totaling ${formatAmount(overviewData.recentActivity.totalRecentSpending)}`
                            }
                            {overviewData.recentActivity.payments > 0 && 
                                ` • ${overviewData.recentActivity.payments} payment${overviewData.recentActivity.payments !== 1 ? 's' : ''}`
                            }
                        </Typography>
                    </Box>
                </Alert>
            ) : null}

            <Grid container spacing={3}>
                {/* Top Spenders */}
                <Grid xs={12} md={6}>
                    <Card sx={{ p: 3, height: 'fit-content' }}>
                        <Typography level="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Top Spenders
                        </Typography>
                        
                        {overviewData.topSpenders.length === 0 ? (
                            <Typography level="body-md" color="neutral">
                                No expenses recorded yet.
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {overviewData.topSpenders.map((spender, index) => (
                                    <Box key={spender.member.email} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography 
                                                level="body-sm" 
                                                sx={{ 
                                                    minWidth: 20,
                                                    textAlign: 'center',
                                                    fontWeight: 'bold',
                                                    color: index === 0 ? 'success.600' : 
                                                           index === 1 ? 'primary.600' : 'warning.600'
                                                }}
                                            >
                                                #{index + 1}
                                            </Typography>
                                            {getMemberAvatar(spender.member)}
                                        </Box>
                                        
                                        <Box sx={{ flex: 1 }}>
                                            <Typography level="title-sm" sx={{ fontWeight: 600 }}>
                                                {spender.member.name || spender.member.email}
                                            </Typography>
                                            <Typography level="body-xs" color="neutral">
                                                {spender.expenseCount} expense{spender.expenseCount !== 1 ? 's' : ''}
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
                                                {formatAmount(spender.expenses)}
                                            </Typography>
                                            <Chip
                                                size="sm"
                                                variant="soft"
                                                color={
                                                    spender.status === 'credit' ? 'success' : 
                                                    spender.status === 'debit' ? 'warning' : 'neutral'
                                                }
                                            >
                                                {spender.status === 'credit' ? 'Gets back' : 
                                                 spender.status === 'debit' ? 'Owes' : 'Even'}
                                            </Chip>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Card>
                </Grid>

                {/* Settlement Status */}
                <Grid xs={12} md={6}>
                    <Card sx={{ p: 3, height: 'fit-content' }}>
                        <Typography level="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Settlement Status
                        </Typography>
                        
                        {overviewData.pendingSettlements.length === 0 ? (
                            <Alert color="success" startDecorator={<CheckCircle />}>
                                All expenses are settled! Everyone is even.
                            </Alert>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {overviewData.pendingSettlements.map((member) => (
                                    <Box key={member.member.email} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {getMemberAvatar(member.member)}
                                            <Box>
                                                <Typography level="title-sm" sx={{ fontWeight: 600 }}>
                                                    {member.member.name || member.member.email}
                                                </Typography>
                                                <Typography level="body-xs" color="neutral">
                                                    Spent: {formatAmount(member.expenses)} |
                                                    Contributed: {formatAmount(member.contributions)} |
                                                    Received: {formatAmount(Math.abs(member.settlements))}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {member.status === 'credit' ? (
                                                        <TrendingUp sx={{ color: 'success.600', fontSize: 16 }} />
                                                    ) : (
                                                        <TrendingDown sx={{ color: 'warning.600', fontSize: 16 }} />
                                                    )}
                                                    <Typography
                                                        level="title-sm"
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            color: member.status === 'credit' ? 'success.600' : 'warning.600'
                                                        }}
                                                    >
                                                        {formatAmount(Math.abs(member.finalBalance))}
                                                    </Typography>
                                                </Box>
                                                <Typography level="body-xs" color="neutral">
                                                    {member.status === 'credit' ? 'to receive' : 'to pay'}
                                                </Typography>
                                            </Box>

                                            {/* Admin-only Settle Button */}
                                            {role === 'Admin' && (
                                                <Button
                                                    size="sm"
                                                    color={member.status === 'credit' ? 'success' : 'warning'}
                                                    variant="solid"
                                                    startDecorator={<Payment />}
                                                    onClick={() => handleSettleClick(member)}
                                                    sx={{ minWidth: 100 }}
                                                >
                                                    Settle
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Card>
                </Grid>
            </Grid>

            {/* Quick Stats */}
            <Card variant="soft" color="primary" sx={{ mt: 3, p: 3 }}>
                <Typography level="h4" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.600' }}>
                    Quick Statistics
                </Typography>
                <Grid container spacing={3}>
                    <Grid xs={6} md={3}>
                        <Box>
                            <Typography level="body-xs" color="neutral">Average per Transaction</Typography>
                            <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                                {formatAmount(overviewData.averagePerTransaction)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid xs={6} md={3}>
                        <Box>
                            <Typography level="body-xs" color="neutral">Highest Single Expense</Typography>
                            <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                                {expenses.length > 0 ? 
                                    formatAmount(Math.max(...expenses.map(e => parseFloat(e.money || 0)))) : 
                                    '₹0'
                                }
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid xs={6} md={3}>
                        <Box>
                            <Typography level="body-xs" color="neutral">Most Active Day</Typography>
                            <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                                {expenses.length > 0 ? 
                                    new Date(expenses[0].created_at).toLocaleDateString('en-IN', { weekday: 'short' }) :
                                    'N/A'
                                }
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid xs={6} md={3}>
                        <Box>
                            <Typography level="body-xs" color="neutral">Balance Range</Typography>
                            <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                                {overviewData.memberBalances.length > 0 ? 
                                    formatAmount(
                                        Math.max(...overviewData.memberBalances.map(mb => Math.abs(mb.balance)))
                                    ) : '₹0'
                                }
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* Settlement Dialog */}
            <SettlementDialog
                open={settlementDialogOpen}
                onClose={() => setSettlementDialogOpen(false)}
                member={selectedMember}
                roomId={roomId}
                onSettlementComplete={handleSettlementComplete}
            />
        </Box>
    );
}