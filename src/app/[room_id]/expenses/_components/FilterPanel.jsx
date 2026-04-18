'use client';

import React from 'react';
import { Box, Card, Select, Input, Option, Chip } from '@mui/joy';

export default function FilterPanel({
    filter,
    setFilter,
    userFilter,
    setUserFilter,
    dateRange,
    setDateRange,
    userMap,
    showAll,
    setShowAll,
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
                            {Object.entries(userMap || {}).map(([email, name]) => (
                                <Option key={email} value={email}>{name}</Option>
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

                        <Chip
                            size="sm"
                            variant="soft"
                            color={showAll ? 'neutral' : 'warning'}
                            onClick={() => setShowAll(v => !v)}
                            sx={{ cursor: 'pointer', whiteSpace: 'nowrap', alignSelf: 'center' }}
                        >
                            {showAll ? 'All expenses' : 'Pending only'}
                        </Chip>
                    </Box>
                </Card>
    );
}