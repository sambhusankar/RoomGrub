'use client';

import React from 'react';
import { Box, Card, Select, Input, Option, Chip, Button } from '@mui/joy';
import { FilterAlt, Clear } from '@mui/icons-material';

export default function FilterPanel({ filters, members, onFilterChange }) {
    const handlePeriodChange = (period) => {
        onFilterChange({ period });
    };

    const handleMemberToggle = (memberEmail) => {
        const currentMembers = filters.selectedMembers || [];
        const newMembers = currentMembers.includes(memberEmail) 
            ? currentMembers.filter(email => email !== memberEmail)
            : [...currentMembers, memberEmail];
        
        onFilterChange({ selectedMembers: newMembers });
    };

    const handleDateChange = (field, value) => {
        onFilterChange({
            dateRange: {
                ...filters.dateRange,
                [field]: value
            }
        });
    };

    const clearFilters = () => {
        onFilterChange({
            dateRange: { from: '', to: '' },
            selectedMembers: [],
            period: 'month',
            category: ''
        });
    };

    const hasActiveFilters = 
        filters.dateRange?.from || 
        filters.dateRange?.to || 
        (filters.selectedMembers?.length > 0) || 
        filters.period !== 'month';

    return (
        <Card
            variant="soft"
            sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                boxShadow: 'none',
                bgcolor: 'background.level1',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterAlt sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Box level="title-sm" sx={{ fontWeight: 600 }}>Filters</Box>
                {hasActiveFilters && (
                    <Button
                        size="sm"
                        variant="outlined"
                        color="neutral"
                        startDecorator={<Clear />}
                        onClick={clearFilters}
                        sx={{ ml: 'auto', fontSize: '0.75rem' }}
                    >
                        Clear All
                    </Button>
                )}
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    alignItems: 'flex-end'
                }}
            >
                {/* Period Filter */}
                <Box sx={{ minWidth: 120 }}>
                    <Box level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>Period</Box>
                    <Select
                        value={filters.period || 'month'}
                        onChange={(_, value) => handlePeriodChange(value)}
                        size="sm"
                        sx={{ minWidth: 120 }}
                    >
                        <Option value="week">Last Week</Option>
                        <Option value="month">Last Month</Option>
                        <Option value="all">All Time</Option>
                    </Select>
                </Box>

                {/* Custom Date Range */}
                <Box sx={{ minWidth: 140 }}>
                    <Box level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>From Date</Box>
                    <Input
                        type="date"
                        value={filters.dateRange?.from || ''}
                        onChange={(e) => handleDateChange('from', e.target.value)}
                        size="sm"
                        sx={{ minWidth: 140 }}
                    />
                </Box>

                <Box sx={{ minWidth: 140 }}>
                    <Box level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>To Date</Box>
                    <Input
                        type="date"
                        value={filters.dateRange?.to || ''}
                        onChange={(e) => handleDateChange('to', e.target.value)}
                        size="sm"
                        sx={{ minWidth: 140 }}
                    />
                </Box>
            </Box>

            {/* Member Filter */}
            <Box sx={{ mt: 2 }}>
                <Box level="body-xs" sx={{ mb: 1, color: 'text.secondary' }}>Filter by Members</Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {members.map(member => (
                        <Chip
                            key={member.email}
                            variant={
                                filters.selectedMembers?.includes(member.email) 
                                    ? "solid" 
                                    : "outlined"
                            }
                            color={
                                filters.selectedMembers?.includes(member.email) 
                                    ? "primary" 
                                    : "neutral"
                            }
                            onClick={() => handleMemberToggle(member.email)}
                            sx={{ 
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                '&:hover': {
                                    bgcolor: filters.selectedMembers?.includes(member.email) 
                                        ? 'primary.600' 
                                        : 'background.level2'
                                }
                            }}
                        >
                            {member.name || member.email}
                        </Chip>
                    ))}
                </Box>
            </Box>
        </Card>
    );
}