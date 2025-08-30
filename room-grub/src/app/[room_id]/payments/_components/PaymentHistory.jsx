'use client'
import React from 'react';
import { Typography, Box } from '@mui/joy';
import FilterPanel from './FilterPanel';
import MonthlyGroup from './MonthlyGroup';

export default function PaymentHistory({ payments }){


    // Filter state
    const [userFilter, setUserFilter] = React.useState('');
    const [dateRange, setDateRange] = React.useState({ from: '', to: '' });
    const [statusFilter, setStatusFilter] = React.useState('');

    // Get unique users for dropdown
    const uniqueUsers = Array.from(new Set(payments.map(p => p.Users?.name || p.user))).filter(Boolean);

    // Filtered payments
    const filteredPayments = payments.filter(payment => {
        const matchesUser = userFilter ? (payment.Users?.name || payment.user) === userFilter : true;
        const paymentDate = payment.created_at?.substring(0, 10);
        const matchesFrom = dateRange.from ? paymentDate >= dateRange.from : true;
        const matchesTo = dateRange.to ? paymentDate <= dateRange.to : true;
        const matchesStatus = statusFilter ? payment.status === statusFilter : true;
        return matchesUser && matchesFrom && matchesTo && matchesStatus;
    });




    // Group payments by month with running balance
    const groupPaymentsByMonth = (payments) => {
        const groups = {};
        payments.forEach(payment => {
            const date = new Date(payment.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            
            if (!groups[monthKey]) {
                groups[monthKey] = {
                    monthName,
                    monthKey,
                    payments: [],
                    moneyIn: 0,
                    moneyOut: 0,
                    monthlyNet: 0,
                    runningBalance: 0
                };
            }
            groups[monthKey].payments.push(payment);
            
            const amount = parseFloat(payment.amount);
            if (payment.status === 'credit') {
                groups[monthKey].moneyIn += amount;
            } else if (payment.status === 'debit') {
                groups[monthKey].moneyOut += amount;
            }
        });
        
        // Sort by month (oldest first for running balance calculation)
        const sortedGroups = Object.values(groups).sort((a, b) => {
            return a.monthKey.localeCompare(b.monthKey);
        });
        
        // Calculate running balance
        let runningBalance = 0;
        sortedGroups.forEach(group => {
            group.monthlyNet = group.moneyIn + group.moneyOut;
            runningBalance += group.monthlyNet;
            group.runningBalance = runningBalance;
        });
        
        // Return sorted by newest first for display
        return sortedGroups.reverse();
    };

    const groupedPayments = groupPaymentsByMonth(filteredPayments);

    return (
        <Box sx={{ 
            bgcolor: '#f8f9fa', 
            minHeight: '100vh',
            pt: 2,
        }}>
            <Box sx={{ px: 2 }}>
                <FilterPanel 
                    userFilter={userFilter}
                    setUserFilter={setUserFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    uniqueUsers={uniqueUsers}
                />
            </Box>

            {filteredPayments.length === 0 ? (
                <Box sx={{ 
                    textAlign: 'center', 
                    mt: 8,
                    py: 6,
                    mx: 2,
                    bgcolor: 'background.surface',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.06)',
                }}>
                    <Box sx={{ 
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: 'neutral.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}>
                        <Typography level="h3" sx={{ color: 'neutral.400' }}>
                            💰
                        </Typography>
                    </Box>
                    <Typography level="title-sm" sx={{ color: 'text.primary', mb: 1 }}>
                        No payments found
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                        Try adjusting your filters or add a new payment
                    </Typography>
                </Box>
            ) : (
                groupedPayments.map((group) => (
                    <MonthlyGroup key={group.monthName} group={group} />
                ))
            )}
        </Box>
    );
};
