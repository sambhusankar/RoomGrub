'use client';

import React from 'react';
import { Box, TextField, Paper } from '@mui/material';

export default function FilterPanel({ 
    filter, 
    setFilter, 
    userFilter, 
    setUserFilter, 
    dateRange, 
    setDateRange, 
    uniqueUsers 
}) {
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
}