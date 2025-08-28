'use client';

import React from 'react';
import { Box, Card, Select, Input, Option } from '@mui/joy';

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
}