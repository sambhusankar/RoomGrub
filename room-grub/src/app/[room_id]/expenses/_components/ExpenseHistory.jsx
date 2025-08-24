'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, Typography } from '@mui/joy';
import { Box, Select, Option, Input } from '@mui/joy';

export default function ExpenseHistory() {
    const supabase = createClient();
    const param = useParams();
    const [filter, setFilter] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [userFilter, setUserFilter] = useState('');

    useEffect(() => {
        // Fetch Expenses from the database with member profile data
        const fetchExpenses = async () => {
            try {
                // First get all expenses
                const { data: expensesData, error: fetchError } = await supabase
                    .from("Spendings")
                    .select("*")
                    .eq("room", param.room_id)
                    .order("created_at", { ascending: false });
                
                if (fetchError) throw fetchError;
                
                // Then get user data for each unique email
                const uniqueEmails = [...new Set(expensesData?.map(e => e.user))].filter(Boolean);
                const { data: usersData, error: usersError } = await supabase
                    .from("Users")
                    .select("email, name, profile")
                    .in("email", uniqueEmails);
                
                if (usersError) throw usersError;
                
                // Merge the data
                const expensesWithUsers = expensesData?.map(expense => ({
                    ...expense,
                    Users: usersData?.find(user => user.email === expense.user)
                }));
                
                setExpenses(expensesWithUsers || []);
            } catch (error) {
                console.error('Error fetching Expenses:', error);
            }
        };

        fetchExpenses();
    }, [param.room_id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    // ExpenseCard component
    const ExpenseCard = ({ user, amount, date, material, userProfile, sx }) => (
        <Card
            variant="outlined"
            sx={{
                mx: 1.5,
                mb: 2,
                borderRadius: 'md',
                ...sx,
            }}
        >
            <CardContent
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        component="img"
                        src={userProfile || '/default-profile.png'}
                        alt={user}
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            bgcolor: 'background.level2',
                            border: '1px solid #eee',
                        }}
                        onError={e => {
                            e.target.onerror = null;
                            e.target.src = '/default-profile.png';
                        }}
                    />
                    <Box>
                        <Typography level="title-sm" sx={{ color: 'black', fontWeight: 500 }}>
                            {user}
                        </Typography>
                        <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
                            {material}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography level="title-sm" sx={{ color: 'black', fontWeight: 500 }}>
                        ₹{amount}
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'neutral.600', whiteSpace: 'nowrap' }}>
                        {date}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    // Filter state
    const [filtersOpen, setFiltersOpen] = React.useState(true);

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

    // FilterPanel component
    const FilterPanel = () => (
        <Card
            variant="soft"
            sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: 'none',
                bgcolor: 'transparent',
                p: 1,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'nowrap',
                    minWidth: 'max-content',
                }}
            >
                <Select
                    value={userFilter}
                    onChange={(_, value) => setUserFilter(value || '')}
                    placeholder="All Users"
                    size="sm"
                    sx={{
                        minWidth: 170,
                        border: '1px solid',
                        borderColor: 'neutral.outlinedBorder',
                        borderRadius: 'md',
                    }}
                >
                    <Option value="">All Users</Option>
                    {uniqueUsers.map(user => (
                        <Option key={user} value={user}>{user}</Option>
                    ))}
                </Select>

                <Input
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    placeholder="Search items..."
                    size="sm"
                    sx={{
                        minWidth: 140,
                        border: '1px solid',
                        borderColor: 'neutral.outlinedBorder',
                        borderRadius: 'md',
                    }}
                />

                <Input
                    type="date"
                    value={dateRange.from}
                    onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
                    size="sm"
                    sx={{
                        minWidth: 140,
                        border: '1px solid',
                        borderColor: 'neutral.outlinedBorder',
                        borderRadius: 'md',
                    }}
                    placeholder="From"
                />

                <Input
                    type="date"
                    value={dateRange.to}
                    onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
                    size="sm"
                    sx={{
                        minWidth: 140,
                        border: '1px solid',
                        borderColor: 'neutral.outlinedBorder',
                        borderRadius: 'md',
                    }}
                    placeholder="To"
                />
            </Box>
        </Card>
    );

    return (
        <Box sx={{ color: 'black', py: 4, bgcolor: 'background.body', minHeight: '100vh' }}>
            <Box sx={{ maxWidth: 600, mx: 'auto', color: 'black' }}>
                <FilterPanel />
                {filteredExpenses.length === 0 ? (
                    <Typography level="body-md" sx={{ textAlign: 'center', mt: 4, color: 'neutral.500' }}>
                        No expenses found
                    </Typography>
                ) : (
                    filteredExpenses.map((expense) => (
                        <ExpenseCard
                            key={expense.id}
                            user={expense.Users?.name || expense.user || 'Unknown User'}
                            amount={parseFloat(expense.money).toFixed(2)}
                            date={formatDate(expense.created_at)}
                            material={expense.material}
                            userProfile={expense.Users?.profile}
                            sx={{ bgcolor: '#f0f8ff' }}
                        />
                    ))
                )}
            </Box>
        </Box>
    );
}