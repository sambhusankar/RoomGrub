'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'
import { Box, Typography, TextField, List, ListItem, ListItemText, Paper, Divider } from '@mui/material';

const ExpenseHistory = () => {
    const supabase = createClient()
    const param = useParams()
    const [filter, setFilter] = useState('');
    const [expenses, setExpenses] = useState([]);
    useEffect(() => {
        // Fetch Expenses from the database
        const fetchExpenses = async () => {
            try {
                const { data: Expenses, error: fetchError } = await supabase
                    .from("Spendings")
                    .select("*")
                    .eq("room", param.room_id);
                if (fetchError) throw fetchError;
                setExpenses(Expenses || []);
            } catch (error) {
                console.error('Error fetching Expenses:', error);
            }
        };

        fetchExpenses();
    }, [param.room_id]);

    // State for new filters
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [userFilter, setUserFilter] = useState('');

    // Get unique users for dropdown
    const uniqueUsers = Array.from(new Set(expenses.map(e => e.user))).filter(Boolean);

    // Apply all filters
    const filteredExpenses = expenses?.filter((expense) => {
        const matchesCategory = expense?.material?.toLowerCase().includes(filter.toLowerCase());
        const matchesUser = userFilter ? expense?.user === userFilter : true;
        const expenseDate = expense?.created_at?.substring(0, 10);
        const matchesFrom = dateRange.from ? expenseDate >= dateRange.from : true;
        const matchesTo = dateRange.to ? expenseDate <= dateRange.to : true;
        return matchesCategory && matchesUser && matchesFrom && matchesTo;
    }) || [];

    // FilterPanel component for all filters, foldable from top
    const [filtersOpen, setFiltersOpen] = useState(true);

    const FilterPanel = React.useMemo(() => {
    return (
        <Paper
            elevation={0}
            sx={{
                mb: 3,
                p: 1,
                borderRadius: 2,
                bgcolor: 'transparent',
                overflowX: 'auto',
                scrollbarWidth: 'none', // Firefox
                '&::-webkit-scrollbar': {
                    display: 'none', // Chrome/Safari
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    gap: 2,
                    minWidth: 'max-content',
                }}
            >
                <TextField
                    label="Category"
                    variant="outlined"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    size="small"
                    sx={{
                        minWidth: 180,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                    }}
                />

                <TextField
                    select
                    label="User"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    SelectProps={{ native: true }}
                    size="small"
                    sx={{
                        minWidth: 160,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                    }}
                >
                    <option value="">Users</option>
                    {uniqueUsers.map(user => (
                        <option key={user} value={user}>{user}</option>
                    ))}
                </TextField>

                <TextField
                    label="From"
                    type="date"
                    value={dateRange.from}
                    onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{
                        minWidth: 140,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                    }}
                />

                <TextField
                    label="To"
                    type="date"
                    value={dateRange.to}
                    onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{
                        minWidth: 140,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                    }}
                />
            </Box>
        </Paper>
    );
}, [filter, setFilter, userFilter, setUserFilter, uniqueUsers, dateRange, setDateRange]);


    return (
        <Box
            sx={{
                p: 4,
                maxWidth: 500,
                mx: 'auto',
                bgcolor: 'background.paper',
                boxShadow: 3,
                borderRadius: 2,
            }}
        >
            {FilterPanel}
            <Paper elevation={0} sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List>
                    {filteredExpenses.length === 0 && (
                        <ListItem>
                            <ListItemText primary="No expenses found." />
                        </ListItem>
                    )}
                    {filteredExpenses.map((expense, idx) => (
                        <React.Fragment key={expense.id}>
                            <ListItem
                                alignItems="flex-start"
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    bgcolor: 'grey.100',
                                    borderRadius: 1,
                                    mb: 1,
                                    boxShadow: 1,
                                }}
                            >
                                <Box>
                                    <Typography fontWeight="medium">{expense.user}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {expense.created_at.substring(0, 10)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {expense.material}
                                    </Typography>
                                </Box>
                                <Typography fontWeight="bold" color="primary.main" variant="h6">
                                    ₹{expense.money}
                                </Typography>
                            </ListItem>
                            {idx < filteredExpenses.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </Box>
    )};

export default ExpenseHistory;