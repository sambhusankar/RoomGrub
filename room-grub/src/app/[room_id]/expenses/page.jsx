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
    console.log('Expenses', expenses)
    const filteredExpenses = expenses?.filter((expense) =>
        expense?.material?.toLowerCase().includes(filter.toLowerCase())
    ) || [];
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
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Expense History
            </Typography>
            <TextField
                fullWidth
                label="Filter by category"
                variant="outlined"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ mb: 3 }}
            />
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