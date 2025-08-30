'use client';

import React from 'react';
import { Box, Card, Select, Input, Option } from '@mui/joy';

export default function FilterPanel({ 
    userFilter, 
    setUserFilter, 
    statusFilter, 
    setStatusFilter, 
    dateRange, 
    setDateRange, 
    uniqueUsers 
}) {
    return (
        <Card
            variant="soft"
            sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: 'none',
                bgcolor: 'transparent',
                p: 1,
                overflowX: 'auto',
                scrollbarWidth: 'none', // Firefox
                '&::-webkit-scrollbar': {
                    display: 'none', // Chrome, Safari
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

                <Select
                    value={statusFilter}
                    onChange={(_, value) => setStatusFilter(value || '')}
                    placeholder="All"
                    size="sm"
                    sx={{
                        minWidth: 90,
                        border: '1px solid',
                        borderColor: 'neutral.outlinedBorder',
                        borderRadius: 'md',
                    }}
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
}