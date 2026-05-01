'use client';

import React from 'react';
import { Box, Card, Button, Typography, Avatar } from '@mui/joy';
import { FilterAlt, Clear } from '@mui/icons-material';
import DateRangePicker from './DateRangePicker';

export default function FilterPanel({ filters, members, onFilterChange }) {
    const handleMemberToggle = (memberEmail) => {
        const currentMembers = filters.selectedMembers || [];
        const newMembers = currentMembers.includes(memberEmail)
            ? currentMembers.filter(email => email !== memberEmail)
            : [...currentMembers, memberEmail];

        onFilterChange({ selectedMembers: newMembers });
    };

    const handleDateRangeChange = ({ from, to }) => {
        onFilterChange({ dateRange: { from, to } });
    };

    const clearFilters = () => {
        onFilterChange({
            dateRange: { from: '', to: '' },
            selectedMembers: []
        });
    };

    const hasActiveFilters =
        filters.dateRange?.from ||
        filters.dateRange?.to ||
        (filters.selectedMembers?.length > 0);

    return (
        <Card
            variant="soft"
            sx={{
                mb: 2,
                p: 2,
                borderRadius: 'md',
                boxShadow: 'none',
                bgcolor: 'background.level1',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterAlt sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography level="title-sm" sx={{ fontWeight: 600 }}>Filters</Typography>
                {hasActiveFilters && (
                    <Button
                        size="sm"
                        variant="outlined"
                        color="neutral"
                        startDecorator={<Clear />}
                        onClick={clearFilters}
                        sx={{ ml: 'auto', fontSize: '0.75rem' }}
                    >
                        Clear
                    </Button>
                )}
            </Box>

            {/* Date Range */}
            <Box sx={{ mb: 2 }}>
                <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                    Date Range
                </Typography>
                <DateRangePicker
                    from={filters.dateRange?.from || ''}
                    to={filters.dateRange?.to || ''}
                    onChange={handleDateRangeChange}
                />
            </Box>

            {/* Member Filter */}
            <Box>
                <Typography level="body-xs" sx={{ mb: 1, color: 'text.secondary' }}>
                    Filter by Members
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        overflowX: 'auto',
                        gap: 1.5,
                        pb: 0.5,
                        '&::-webkit-scrollbar': { height: '4px' },
                        '&::-webkit-scrollbar-thumb': { borderRadius: '4px', bgcolor: 'neutral.300' },
                    }}
                >
                    {members.map(member => {
                        const isSelected = filters.selectedMembers?.includes(member.email);
                        const displayName = (member.name || member.email).split(' ')[0];
                        return (
                            <Box
                                key={member.email}
                                onClick={() => handleMemberToggle(member.email)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    p: 0.5,
                                }}
                            >
                                <Avatar
                                    {...(member.profile ? { src: member.profile } : {})}
                                    size="md"
                                    sx={{
                                        border: '2.5px solid',
                                        borderColor: isSelected ? 'primary.500' : 'neutral.300',
                                        transition: 'border-color 0.15s',
                                    }}
                                >
                                    {(member.name || member.email).charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography level="body-xs" sx={{ fontSize: '0.7rem', textAlign: 'center' }}>
                                    {displayName}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Card>
    );
}
