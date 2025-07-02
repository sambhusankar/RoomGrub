'use client'
import React from 'react';
import { Card, CardContent, Typography } from '@mui/joy';
import { Box, Button, Select, Option, Input, Divider, Chip } from '@mui/joy';

export default function PaymentHistory({ payments }){
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    // Override PaymentHistoryCard to use MUI Joy
    const PaymentHistoryCard = ({ user, amount, date, sx }) => (
        <Card variant="outlined" sx={{ mb: 2, ...sx }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography level="title-md" sx={{ color: 'black', fontWeight: 'bold' }}>{user}</Typography>
                <Typography level="body-sm" sx={{ color: 'black' }}>{date}</Typography>
                <Typography level="title-md" sx={{ color: 'black', fontWeight: 'bold' }}>₹{amount}</Typography>
            </CardContent>
        </Card>
    );

    // Filter state
    const [filtersOpen, setFiltersOpen] = React.useState(true);
    const [userFilter, setUserFilter] = React.useState('');
    const [dateRange, setDateRange] = React.useState({ from: '', to: '' });
    const [statusFilter, setStatusFilter] = React.useState('');

    // Get unique users for dropdown
    const uniqueUsers = Array.from(new Set(payments.map(p => p.user))).filter(Boolean);

    // Filtered payments
    const filteredPayments = payments.filter(payment => {
        const matchesUser = userFilter ? payment.user === userFilter : true;
        const paymentDate = payment.created_at?.substring(0, 10);
        const matchesFrom = dateRange.from ? paymentDate >= dateRange.from : true;
        const matchesTo = dateRange.to ? paymentDate <= dateRange.to : true;
        const matchesStatus = statusFilter ? payment.status === statusFilter : true;
        return matchesUser && matchesFrom && matchesTo && matchesStatus;
    });

    // FilterPanel component
    const FilterPanel = () => (
        <Card
            variant="soft"
            sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: 'sm',
                bgcolor: 'background.level1',
                p: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    mb: filtersOpen ? 2 : 0,
                }}
                onClick={() => setFiltersOpen(open => !open)}
            >
                <Typography level="title-md" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                    Filters
                </Typography>
                <Typography level="body-sm" color="primary">
                    {filtersOpen ? 'Hide ▲' : 'Show ▼'}
                </Typography>
            </Box>
            {filtersOpen && (
                <Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <Select
                            value={userFilter}
                            onChange={(_, value) => setUserFilter(value || '')}
                            placeholder="All Users"
                            size="sm"
                            sx={{ minWidth: 170, flex: 1 }}
                        >
                            <Option value="">All Users</Option>
                            {uniqueUsers.map(user => (
                                <Option key={user} value={user}>{user}</Option>
                            ))}
                        </Select>
                        <Select
                            value={statusFilter}
                            onChange={(_, value) => setStatusFilter(value || '')}
                            placeholder="All"
                            size="sm"
                            sx={{ minWidth: 90, flex: 1 }}
                        >
                            <Option value="">All</Option>
                            <Option value="credit">Credit</Option>
                            <Option value="debit">Debit</Option>
                        </Select>
                        <Input
                            type="date"
                            value={dateRange.from}
                            onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
                            size="sm"
                            sx={{ minWidth: 120, flex: 1 }}
                            placeholder="From"
                        />
                        <Input
                            type="date"
                            value={dateRange.to}
                            onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
                            size="sm"
                            sx={{ minWidth: 120, flex: 1 }}
                            placeholder="To"
                        />
                    </Box>
                </Box>
            )}
        </Card>
    );

    return (
        <Box sx={{ color: 'black', py: 4, bgcolor: 'background.body', minHeight: '100vh' }}>
            <Typography level="h2" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold', letterSpacing: 1 }}>
                Payment History
            </Typography>
            <Box sx={{ maxWidth: 600, mx: 'auto', color: 'black' }}>
                <FilterPanel />
                {filteredPayments.length === 0 ? (
                    <Typography level="body-md" sx={{ textAlign: 'center', mt: 4, color: 'neutral.500' }}>
                        No payments found
                    </Typography>
                ) : (
                    filteredPayments.map((payment) => {
                        // Set background color based on status
                        let bgColor;
                        if (payment.status === 'credit') bgColor = '#e6f7e6'; // light green
                        else if (payment.status === 'debit') bgColor = '#fff3e6'; // light orange
                        else bgColor = '#f9f9f9'; // default

                        return (
                            <PaymentHistoryCard
                                key={payment.id}
                                user={payment.user || 'Unknown User'}
                                amount={parseFloat(payment.amount).toFixed(2)}
                                date={formatDate(payment.created_at)}
                                sx={{ bgcolor: bgColor }}
                            />
                        );
                    })
                )}
            </Box>
        </Box>
    );
};
