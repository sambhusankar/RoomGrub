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
            <Paper elevation={1} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
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
                    <Typography variant="subtitle1" fontWeight="bold">
                        Filters
                    </Typography>
                    <Typography variant="body2" color="primary">
                        {filtersOpen ? 'Hide ▲' : 'Show ▼'}
                    </Typography>
                </Box>
                {filtersOpen && (
                    <Box>
                        <TextField
                            fullWidth
                            label="Filter by category"
                            variant="outlined"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Filter by user"
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            SelectProps={{ native: true }}
                            sx={{ mb: 2 }}
                        >
                            <option value="">All Users</option>
                            {uniqueUsers.map(user => (
                                <option key={user} value={user}>{user}</option>
                            ))}
                        </TextField>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="From date"
                                type="date"
                                value={dateRange.from}
                                onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="To date"
                                type="date"
                                value={dateRange.to}
                                onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Box>
                    </Box>
                )}
            </Paper>
        );
    // dependencies: only re-create if these change
    }, [filtersOpen, filter, setFilter, userFilter, setUserFilter, uniqueUsers, dateRange, setDateRange]);

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
            <Typography variant="h5" fontWeight="bold" mb={3} color="black">
                Expense History
            </Typography>
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