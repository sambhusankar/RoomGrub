'use client';

import React, { useMemo, useState } from 'react';
import { 
    Box, 
    Typography, 
    Card, 
    Grid, 
    Button, 
    Table, 
    Sheet,
    Avatar,
    Chip,
    Alert
} from '@mui/joy';
import { 
    TrendingUp, 
    TrendingDown, 
    AccountBalance,
    Calculate,
    CheckCircle,
    Warning
} from '@mui/icons-material';

export default function SplitCalculator({ expenses, payments, members, filters }) {
    const [viewMode, setViewMode] = useState('summary'); // summary, detailed, settlements

    // Calculate the smart split for the current period
    const splitCalculation = useMemo(() => {
        // Determine which members to include based on filter
        const activeMembers = filters.selectedMembers.length > 0
            ? members.filter(m => filters.selectedMembers.includes(m.email))
            : members;

        // Calculate total expenses for each member
        const memberExpenses = {};
        const memberPayments = {};

        // Initialize member data only for active members
        activeMembers.forEach(member => {
            memberExpenses[member.email] = 0;
            memberPayments[member.email] = 0;
        });

        // Sum up expenses per member
        expenses.forEach(expense => {
            if (memberExpenses.hasOwnProperty(expense.user)) {
                memberExpenses[expense.user] += parseFloat(expense.money || 0);
            }
        });

        // Sum up payments (contributions) per member
        payments.forEach(payment => {
            if (memberPayments.hasOwnProperty(payment.user)) {
                if (payment.status === 'credit') {
                    memberPayments[payment.user] += parseFloat(payment.amount || 0);
                } else if (payment.status === 'debit') {
                    memberPayments[payment.user] -= parseFloat(payment.amount || 0);
                }
            }
        });

        // Calculate totals
        const totalExpenses = Object.values(memberExpenses).reduce((sum, amount) => sum + amount, 0);
        const totalPayments = Object.values(memberPayments).reduce((sum, amount) => sum + amount, 0);
        const numberOfMembers = activeMembers.length;
        const equalShare = totalExpenses / numberOfMembers;

        // Calculate balances and settlements
        const memberBalances = [];
        activeMembers.forEach(member => {
            const spent = memberExpenses[member.email];
            const paid = memberPayments[member.email];
            const shouldPay = equalShare;
            const balance = spent - shouldPay; // Positive means they should get money back, negative means they owe
            
            memberBalances.push({
                member,
                spent,
                paid,
                shouldPay,
                balance,
                status: balance > 0 ? 'credit' : balance < 0 ? 'debit' : 'even'
            });
        });

        // Calculate settlements - who pays whom
        const settlements = [];
        const creditors = memberBalances.filter(mb => mb.balance > 0).sort((a, b) => b.balance - a.balance);
        const debtors = memberBalances.filter(mb => mb.balance < 0).sort((a, b) => a.balance - b.balance);

        let creditorIndex = 0;
        let debtorIndex = 0;

        while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
            const creditor = creditors[creditorIndex];
            const debtor = debtors[debtorIndex];
            
            const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
            
            if (amount > 0.01) { // Avoid tiny settlements
                settlements.push({
                    from: debtor.member,
                    to: creditor.member,
                    amount: amount
                });
            }

            creditor.balance -= amount;
            debtor.balance += amount;

            if (Math.abs(creditor.balance) < 0.01) creditorIndex++;
            if (Math.abs(debtor.balance) < 0.01) debtorIndex++;
        }

        return {
            totalExpenses,
            totalPayments,
            equalShare,
            memberBalances,
            settlements,
            numberOfMembers
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

    return (
        <Box>
            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid xs={12} md={3}>
                    <Card variant="soft" color="primary">
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Calculate color="primary" />
                                <Typography level="body-sm">Total Expenses</Typography>
                            </Box>
                            <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                                {formatAmount(splitCalculation.totalExpenses)}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>

                <Grid xs={12} md={3}>
                    <Card variant="soft" color="success">
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AccountBalance color="success" />
                                <Typography level="body-sm">Per Person</Typography>
                            </Box>
                            <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                                {formatAmount(splitCalculation.equalShare)}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>

                <Grid xs={12} md={3}>
                    <Card variant="soft" color="warning">
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Warning color="warning" />
                                <Typography level="body-sm">Settlements Needed</Typography>
                            </Box>
                            <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                                {splitCalculation.settlements.length}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>

                <Grid xs={12} md={3}>
                    <Card variant="soft" color="neutral">
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CheckCircle color="success" />
                                <Typography level="body-sm">Members</Typography>
                            </Box>
                            <Typography level="h4" sx={{ fontWeight: 'bold' }}>
                                {filters.selectedMembers.length > 0 ? filters.selectedMembers.length : members.length}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* View Mode Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button
                    variant={viewMode === 'summary' ? 'solid' : 'outlined'}
                    onClick={() => setViewMode('summary')}
                    size="sm"
                >
                    Summary
                </Button>
                <Button
                    variant={viewMode === 'detailed' ? 'solid' : 'outlined'}
                    onClick={() => setViewMode('detailed')}
                    size="sm"
                >
                    Detailed View
                </Button>
                <Button
                    variant={viewMode === 'settlements' ? 'solid' : 'outlined'}
                    onClick={() => setViewMode('settlements')}
                    size="sm"
                >
                    Settlements
                </Button>
            </Box>

            {/* Summary View */}
            {viewMode === 'summary' && (
                <Grid container spacing={2}>
                    {splitCalculation.memberBalances.map((memberBalance) => (
                        <Grid xs={12} md={6} key={memberBalance.member.email}>
                            <Card 
                                variant="outlined"
                                color={
                                    memberBalance.status === 'credit' ? 'success' : 
                                    memberBalance.status === 'debit' ? 'warning' : 'neutral'
                                }
                            >
                                <Box sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        {getMemberAvatar(memberBalance.member)}
                                        <Typography level="title-md" sx={{ fontWeight: 600 }}>
                                            {memberBalance.member.name || memberBalance.member.email}
                                        </Typography>
                                        <Chip
                                            size="sm"
                                            variant="soft"
                                            color={
                                                memberBalance.status === 'credit' ? 'success' : 
                                                memberBalance.status === 'debit' ? 'warning' : 'neutral'
                                            }
                                        >
                                            {memberBalance.status === 'credit' ? 'Gets Back' : 
                                             memberBalance.status === 'debit' ? 'Owes' : 'Even'}
                                        </Chip>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography level="body-sm" color="neutral">
                                            Spent: {formatAmount(memberBalance.spent)}
                                        </Typography>
                                        <Typography level="body-sm" color="neutral">
                                            Should Pay: {formatAmount(memberBalance.shouldPay)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {memberBalance.status === 'credit' ? (
                                            <TrendingUp color="success" />
                                        ) : memberBalance.status === 'debit' ? (
                                            <TrendingDown color="warning" />
                                        ) : (
                                            <CheckCircle color="success" />
                                        )}
                                        <Typography 
                                            level="title-lg" 
                                            sx={{ 
                                                fontWeight: 'bold',
                                                color: memberBalance.status === 'credit' ? 'success.600' : 
                                                       memberBalance.status === 'debit' ? 'warning.600' : 'success.600'
                                            }}
                                        >
                                            {memberBalance.status === 'even' ? 
                                                'All Settled' : 
                                                formatAmount(memberBalance.balance)
                                            }
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Detailed View */}
            {viewMode === 'detailed' && (
                <Sheet variant="outlined" sx={{ borderRadius: 'md' }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Amount Spent</th>
                                <th>Should Pay</th>
                                <th>Balance</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {splitCalculation.memberBalances.map((memberBalance) => (
                                <tr key={memberBalance.member.email}>
                                    <td>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {getMemberAvatar(memberBalance.member)}
                                            {memberBalance.member.name || memberBalance.member.email}
                                        </Box>
                                    </td>
                                    <td>{formatAmount(memberBalance.spent)}</td>
                                    <td>{formatAmount(memberBalance.shouldPay)}</td>
                                    <td>
                                        <Typography
                                            sx={{
                                                color: memberBalance.status === 'credit' ? 'success.600' : 
                                                       memberBalance.status === 'debit' ? 'warning.600' : 'text.primary'
                                            }}
                                        >
                                            {memberBalance.status === 'even' ? '₹0' : formatAmount(memberBalance.balance)}
                                        </Typography>
                                    </td>
                                    <td>
                                        <Chip
                                            size="sm"
                                            variant="soft"
                                            color={
                                                memberBalance.status === 'credit' ? 'success' : 
                                                memberBalance.status === 'debit' ? 'warning' : 'neutral'
                                            }
                                        >
                                            {memberBalance.status === 'credit' ? 'Gets Back' : 
                                             memberBalance.status === 'debit' ? 'Owes' : 'Settled'}
                                        </Chip>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Sheet>
            )}

            {/* Settlements View */}
            {viewMode === 'settlements' && (
                <Box>
                    {splitCalculation.settlements.length === 0 ? (
                        <Alert color="success" startDecorator={<CheckCircle />}>
                            All expenses are settled! No payments needed.
                        </Alert>
                    ) : (
                        <>
                            <Typography level="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Settlement Instructions
                            </Typography>
                            <Grid container spacing={2}>
                                {splitCalculation.settlements.map((settlement, index) => (
                                    <Grid xs={12} md={6} key={index}>
                                        <Card variant="outlined" color="primary">
                                            <Box sx={{ p: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    {getMemberAvatar(settlement.from)}
                                                    <Typography level="body-md">
                                                        {settlement.from.name || settlement.from.email}
                                                    </Typography>
                                                    <Typography level="title-sm" sx={{ mx: 1 }}>
                                                        →
                                                    </Typography>
                                                    {getMemberAvatar(settlement.to)}
                                                    <Typography level="body-md">
                                                        {settlement.to.name || settlement.to.email}
                                                    </Typography>
                                                </Box>
                                                <Typography level="title-lg" sx={{ fontWeight: 'bold', color: 'primary.600' }}>
                                                    {formatAmount(settlement.amount)}
                                                </Typography>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </Box>
            )}
        </Box>
    );
}