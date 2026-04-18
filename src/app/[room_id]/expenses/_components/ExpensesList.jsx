'use client';

import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, Divider } from '@mui/material';

export default function ExpensesList({ filteredExpenses }) {
    return (
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
    );
}