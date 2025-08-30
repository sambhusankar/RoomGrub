'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    Grid, 
    Avatar,
    LinearProgress,
    Chip
} from '@mui/joy';
import { 
    TrendingUp, 
    Person, 
    DateRange,
    Category
} from '@mui/icons-material';

export default function ExpenseCharts({ expenses, payments, members, filters }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    // Process data for different chart types
    const chartData = useMemo(() => {
        // Weekly data
        const weeklyData = {};
        const monthlyData = {};
        const memberData = {};
        
        // Initialize member data
        members.forEach(member => {
            memberData[member.email] = {
                member,
                totalExpenses: 0,
                totalPayments: 0,
                expenseCount: 0
            };
        });

        // Process expenses
        expenses.forEach(expense => {
            const date = new Date(expense.created_at);
            const weekKey = getWeekKey(date);
            const monthKey = getMonthKey(date);
            const amount = parseFloat(expense.money || 0);

            // Weekly aggregation
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = { date: weekKey, amount: 0, count: 0 };
            }
            weeklyData[weekKey].amount += amount;
            weeklyData[weekKey].count += 1;

            // Monthly aggregation  
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { date: monthKey, amount: 0, count: 0 };
            }
            monthlyData[monthKey].amount += amount;
            monthlyData[monthKey].count += 1;

            // Member aggregation
            if (memberData[expense.user]) {
                memberData[expense.user].totalExpenses += amount;
                memberData[expense.user].expenseCount += 1;
            }
        });

        // Process payments
        payments.forEach(payment => {
            const amount = parseFloat(payment.amount || 0);
            if (memberData[payment.user]) {
                if (payment.status === 'credit') {
                    memberData[payment.user].totalPayments += amount;
                } else if (payment.status === 'debit') {
                    memberData[payment.user].totalPayments -= amount;
                }
            }
        });

        return {
            weekly: Object.values(weeklyData).sort((a, b) => new Date(a.date) - new Date(b.date)),
            monthly: Object.values(monthlyData).sort((a, b) => new Date(a.date) - new Date(b.date)),
            members: Object.values(memberData).sort((a, b) => b.totalExpenses - a.totalExpenses)
        };
    }, [expenses, payments, members]);

    // Helper function to safely get max expense
    const getMaxExpense = () => {
        if (!chartData.members || chartData.members.length === 0) return 1;
        return Math.max(...chartData.members.map(m => m.totalExpenses), 1);
    };

    // Helper functions
    const getWeekKey = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return startOfWeek.toISOString().split('T')[0];
    };

    const getMonthKey = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { 
            month: 'short',
            day: 'numeric'
        });
    };

    const formatMonth = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { 
            year: 'numeric',
            month: 'short'
        });
    };

    const maxExpense = getMaxExpense();

    // Show loading state during hydration
    if (!mounted) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <Typography level="body-md" color="neutral">Loading charts...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Week-wise Expenses */}
            <Card sx={{ mb: 3, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <DateRange color="primary" />
                    <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                        Weekly Expense Trend
                    </Typography>
                </Box>
                
                {!chartData.weekly || chartData.weekly.length === 0 ? (
                    <Typography level="body-md" color="neutral">
                        No weekly data available for the selected period.
                    </Typography>
                ) : (
                    <Grid container spacing={1}>
                        {chartData.weekly.map((week, index) => (
                            <Grid xs={6} sm={4} md={3} key={week.date}>
                                <Card variant="soft" size="sm">
                                    <Box sx={{ p: 1.5 }}>
                                        <Typography level="body-xs" color="neutral" sx={{ mb: 0.5 }}>
                                            {formatDate(week.date)}
                                        </Typography>
                                        <Typography level="title-sm" sx={{ fontWeight: 'bold' }}>
                                            {formatAmount(week.amount)}
                                        </Typography>
                                        <Typography level="body-xs" color="neutral">
                                            {week.count} expense{week.count !== 1 ? 's' : ''}
                                        </Typography>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Card>

            {/* Month-wise Expenses */}
            <Card sx={{ mb: 3, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TrendingUp color="success" />
                    <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                        Monthly Expense Trend
                    </Typography>
                </Box>
                
                {!chartData.monthly || chartData.monthly.length === 0 ? (
                    <Typography level="body-md" color="neutral">
                        No monthly data available for the selected period.
                    </Typography>
                ) : (
                    <Grid container spacing={2}>
                        {chartData.monthly.map((month, index) => (
                            <Grid xs={12} sm={6} md={4} key={month.date}>
                                <Card variant="outlined" color="success">
                                    <Box sx={{ p: 2 }}>
                                        <Typography level="body-sm" color="neutral" sx={{ mb: 1 }}>
                                            {formatMonth(month.date)}
                                        </Typography>
                                        <Typography level="h4" sx={{ fontWeight: 'bold', color: 'success.600', mb: 1 }}>
                                            {formatAmount(month.amount)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography level="body-xs" color="neutral">
                                                {month.count} transactions
                                            </Typography>
                                            <Chip size="sm" variant="soft" color="success">
                                                {Math.round(month.amount / month.count) > 0 ? 
                                                    formatAmount(month.amount / month.count) + ' avg' : '₹0'
                                                }
                                            </Chip>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Card>

            {/* Member-wise Expenses */}
            <Card sx={{ mb: 3, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Person color="primary" />
                    <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                        Member-wise Expenses
                    </Typography>
                </Box>
                
                <Grid container spacing={2}>
                    {chartData.members && chartData.members.map((memberData, index) => (
                        <Grid xs={12} sm={6} md={6} key={memberData.member.email}>
                            <Card variant="outlined">
                                <Box sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Avatar 
                                            src={memberData.member.profile} 
                                            size="md"
                                        >
                                            {(memberData.member.name || memberData.member.email).charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography level="title-sm" sx={{ fontWeight: 600 }}>
                                                {memberData.member.name || memberData.member.email}
                                            </Typography>
                                            <Typography level="body-xs" color="neutral">
                                                {memberData.expenseCount} expense{memberData.expenseCount !== 1 ? 's' : ''}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
                                                {formatAmount(memberData.totalExpenses)}
                                            </Typography>
                                            {memberData.totalPayments !== 0 && (
                                                <Typography 
                                                    level="body-xs" 
                                                    sx={{ 
                                                        color: memberData.totalPayments > 0 ? 'success.600' : 'warning.600'
                                                    }}
                                                >
                                                    {memberData.totalPayments > 0 ? '+' : ''}{formatAmount(memberData.totalPayments)} paid
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    
                                    {/* Expense visualization bar */}
                                    <LinearProgress
                                        determinate
                                        value={(memberData.totalExpenses / maxExpense) * 100}
                                        color={
                                            index === 0 ? 'success' : 
                                            index === 1 ? 'primary' : 
                                            index === 2 ? 'warning' : 'neutral'
                                        }
                                        sx={{ 
                                            '--LinearProgress-thickness': '6px',
                                            '--LinearProgress-radius': '3px'
                                        }}
                                    />
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Card>

            {/* Summary Stats */}
            <Card variant="soft" color="primary" sx={{ p: 3 }}>
                <Typography level="h4" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.600' }}>
                    Summary Statistics
                </Typography>
                <Grid container spacing={2}>
                    <Grid xs={6} md={3}>
                        <Box>
                            <Typography level="body-xs" color="neutral">Total Expenses</Typography>
                            <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                                {formatAmount((chartData.members || []).reduce((sum, m) => sum + m.totalExpenses, 0))}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid xs={6} md={3}>
                        <Box>
                            <Typography level="body-xs" color="neutral">Total Transactions</Typography>
                            <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                                {(chartData.members || []).reduce((sum, m) => sum + m.expenseCount, 0)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid xs={6} md={3}>
                        <Box>
                            <Typography level="body-xs" color="neutral">Avg per Transaction</Typography>
                            <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                                {(chartData.members || []).reduce((sum, m) => sum + m.expenseCount, 0) > 0 ? 
                                    formatAmount(
                                        (chartData.members || []).reduce((sum, m) => sum + m.totalExpenses, 0) / 
                                        (chartData.members || []).reduce((sum, m) => sum + m.expenseCount, 0)
                                    ) : '₹0'
                                }
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid xs={6} md={3}>
                        <Box>
                            <Typography level="body-xs" color="neutral">Active Members</Typography>
                            <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                                {(chartData.members || []).filter(m => m.totalExpenses > 0).length}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>
        </Box>
    );
}