'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, Typography } from '@mui/joy';
import { Box, Select, Option, Input } from '@mui/joy';
import FilterPanel from './FilterPanel';
import ExpenseCard from './ExpenseCard';

export default function ExpenseHistory({ expenses }) {
    const param = useParams();
    const [filter, setFilter] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [userFilter, setUserFilter] = useState('');

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    // Get unique users for dropdown
    const uniqueUsers = Array.from(new Set(expenses.map(e => e.Users?.name || e.user))).filter(Boolean);

    // Filtered expenses
    const filteredExpenses = expenses.filter(expense => {
        const matchesCategory = expense?.material?.toLowerCase().includes(filter.toLowerCase());
        const matchesUser = userFilter ? (expense?.Users?.name || expense?.user) === userFilter : true;
        const expenseDate = expense?.created_at?.substring(0, 10);
        const matchesFrom = dateRange.from ? expenseDate >= dateRange.from : true;
        const matchesTo = dateRange.to ? expenseDate <= dateRange.to : true;
        return matchesCategory && matchesUser && matchesFrom && matchesTo;
    });

    // Group expenses by month
    const groupExpensesByMonth = (expenses) => {
        const groups = {};
        expenses.forEach(expense => {
            const date = new Date(expense.created_at);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            const monthName = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            
            if (!groups[monthKey]) {
                groups[monthKey] = {
                    monthName,
                    expenses: [],
                    total: 0
                };
            }
            groups[monthKey].expenses.push(expense);
            groups[monthKey].total += parseFloat(expense.money);
        });
        
        return Object.values(groups).sort((a, b) => {
            const [yearA, monthA] = Object.keys(groups).find(key => groups[key] === a).split('-');
            const [yearB, monthB] = Object.keys(groups).find(key => groups[key] === b).split('-');
            return new Date(yearB, monthB) - new Date(yearA, monthA);
        });
    };

    const groupedExpenses = groupExpensesByMonth(filteredExpenses);

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Box sx={{ 
            bgcolor: '#f8f9fa', 
            minHeight: '100vh',
            pt: 2,
        }}>
            <Box sx={{ px: 2 }}>
                <FilterPanel
                    filter={filter}
                    setFilter={setFilter}
                    userFilter={userFilter}
                    setUserFilter={setUserFilter}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    uniqueUsers={uniqueUsers}
                />
            </Box>

            {filteredExpenses.length === 0 ? (
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
                            💸
                        </Typography>
                    </Box>
                    <Typography level="title-sm" sx={{ color: 'text.primary', mb: 1 }}>
                        No expenses found
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                        Try adjusting your filters or add a new expense
                    </Typography>
                </Box>
            ) : (
                groupedExpenses.map((group) => (
                    <Box key={group.monthName} sx={{ mb: 3 }}>
                        {/* Month Header */}
                        <Box sx={{ 
                            px: 2,
                            py: 2,
                            bgcolor: 'background.surface',
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
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
                                    color: 'text.primary',
                                }}
                            >
                                {formatAmount(group.total)}
                            </Typography>
                        </Box>

                        {/* Month's Expenses */}
                        <Box sx={{ bgcolor: 'background.surface' }}>
                            {group.expenses.map((expense, index) => (
                                <Box key={expense.id}>
                                    <ExpenseCard
                                        user={expense.Users?.name || expense.user || 'Unknown User'}
                                        amount={parseFloat(expense.money)}
                                        date={expense.created_at}
                                        material={expense.material}
                                        userProfile={expense.Users?.profile}
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
                                    {index < group.expenses.length - 1 && (
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
                ))
            )}
        </Box>
    );
}