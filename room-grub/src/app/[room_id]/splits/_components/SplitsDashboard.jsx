'use client';

import React, { useState, useMemo } from 'react';
import { Box } from '@mui/joy';
import { useRouter, useSearchParams } from 'next/navigation';
import SplitCalculator from './SplitCalculator';
import FilterPanel from './FilterPanel';

export default function SplitsDashboard({ expenses, payments, members, roomId, userRole }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFilters] = useState(() => {
        if (typeof window === 'undefined') {
            return {
                dateRange: { from: '', to: '' },
                selectedMembers: []
            };
        }

        return {
            dateRange: {
                from: searchParams.get('from') || '',
                to: searchParams.get('to') || ''
            },
            selectedMembers: searchParams.get('members') ? searchParams.get('members').split(',') : []
        };
    });

    // Filter data based on current filters
    const filteredData = useMemo(() => {
        let filteredExpenses = expenses;
        let filteredPayments = payments;

        // Date range filter
        if (filters.dateRange.from) {
            const fromDate = new Date(filters.dateRange.from);
            filteredExpenses = filteredExpenses.filter(exp =>
                new Date(exp.created_at) >= fromDate
            );
            filteredPayments = filteredPayments.filter(pay =>
                new Date(pay.created_at) >= fromDate
            );
        }

        if (filters.dateRange.to) {
            const toDate = new Date(filters.dateRange.to);
            filteredExpenses = filteredExpenses.filter(exp =>
                new Date(exp.created_at) <= toDate
            );
            filteredPayments = filteredPayments.filter(pay =>
                new Date(pay.created_at) <= toDate
            );
        }

        // Member filter
        if (filters.selectedMembers.length > 0) {
            filteredExpenses = filteredExpenses.filter(exp =>
                filters.selectedMembers.includes(exp.user)
            );
            filteredPayments = filteredPayments.filter(pay =>
                filters.selectedMembers.includes(pay.user)
            );
        }

        return {
            expenses: filteredExpenses,
            payments: filteredPayments
        };
    }, [expenses, payments, filters]);

    // Update URL when filters change
    const handleFilterChange = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);

        const params = new URLSearchParams(searchParams);

        // Update URL params
        if (updatedFilters.dateRange?.from) {
            params.set('from', updatedFilters.dateRange.from);
        } else {
            params.delete('from');
        }

        if (updatedFilters.dateRange?.to) {
            params.set('to', updatedFilters.dateRange.to);
        } else {
            params.delete('to');
        }

        if (updatedFilters.selectedMembers?.length > 0) {
            params.set('members', updatedFilters.selectedMembers.join(','));
        } else {
            params.delete('members');
        }

        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <Box sx={{
            p: { xs: 2, md: 4 },
            bgcolor: '#faf5ff',
            minHeight: '100vh'
        }}>
            {/* Filter Panel */}
            <FilterPanel
                filters={filters}
                members={members}
                onFilterChange={handleFilterChange}
            />

            <SplitCalculator
                expenses={filteredData.expenses}
                payments={filteredData.payments}
                members={members}
                filters={filters}
                roomId={roomId}
                userRole={userRole}
            />
        </Box>
    );
}
