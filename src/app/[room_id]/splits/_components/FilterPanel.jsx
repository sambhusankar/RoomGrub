'use client';

import React from 'react';
import { Box, Card, Input, Chip, Button, Typography } from '@mui/joy';
import { FilterAlt, Clear } from '@mui/icons-material';

export default function FilterPanel({ filters, members, onFilterChange }) {
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
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 1.5,
                    mb: 2
                }}
            >
                <Box>
                    <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        Start Date
                    </Typography>
                    <Input
                        type="date"
                        value={filters.dateRange?.from || ''}
                        onChange={(e) => handleDateChange('from', e.target.value)}
                        size="sm"
                    />
                </Box>

                <Box>
                    <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        End Date
                    </Typography>
                    <Input
                        type="date"
                        value={filters.dateRange?.to || ''}
                        onChange={(e) => handleDateChange('to', e.target.value)}
                        size="sm"
                    />
                </Box>
            </Box>

            {/* Member Filter */}
            <Box>
                <Typography level="body-xs" sx={{ mb: 1, color: 'text.secondary' }}>
                    Filter by Members
                </Typography>
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