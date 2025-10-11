'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Tabs, TabList, Tab, TabPanel } from '@mui/joy';
import { useRouter, useSearchParams } from 'next/navigation';
import AnalyticsOverview from './AnalyticsOverview';
import ExpenseCharts from './ExpenseCharts';
import SplitCalculator from './SplitCalculator';
import ReportGenerator from './ReportGenerator';
import FilterPanel from './FilterPanel';

export default function AnalyticsDashboard({ expenses, payments, members, roomId }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    
    // Initialize state from URL params
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window === 'undefined') return 0;
        const tab = searchParams.get('tab');
        const tabMap = { 'overview': 0, 'charts': 1, 'splits': 2, 'reports': 3 };
        return tabMap[tab] ?? 0;
    });
    
    const [filters, setFilters] = useState(() => {
        if (typeof window === 'undefined') {
            return {
                dateRange: { from: '', to: '' },
                selectedMembers: [],
                period: 'month',
                category: ''
            };
        }
        
        return {
            dateRange: { 
                from: searchParams.get('from') || '', 
                to: searchParams.get('to') || '' 
            },
            selectedMembers: searchParams.get('members') ? searchParams.get('members').split(',') : [],
            period: searchParams.get('period') || 'month',
            category: searchParams.get('category') || ''
        };
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Update URL when tab changes
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        const tabNames = ['overview', 'charts', 'splits', 'reports'];
        const params = new URLSearchParams(searchParams);
        params.set('tab', tabNames[newValue]);
        router.push(`?${params.toString()}`, { scroll: false });
    };

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

        // Period filter (last week, month, etc.)
        if (filters.period !== 'all') {
            const now = new Date();
            let startDate;

            if (filters.period === 'week') {
                startDate = new Date(now.setDate(now.getDate() - 7));
            } else if (filters.period === 'month') {
                startDate = new Date(now.setMonth(now.getMonth() - 1));
            }

            if (startDate) {
                filteredExpenses = filteredExpenses.filter(exp => 
                    new Date(exp.created_at) >= startDate
                );
                filteredPayments = filteredPayments.filter(pay => 
                    new Date(pay.created_at) >= startDate
                );
            }
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
        
        if (updatedFilters.period && updatedFilters.period !== 'month') {
            params.set('period', updatedFilters.period);
        } else {
            params.delete('period');
        }
        
        if (updatedFilters.category) {
            params.set('category', updatedFilters.category);
        } else {
            params.delete('category');
        }
        
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <Box sx={{ 
            p: { xs: 2, md: 4 }, 
            bgcolor: 'background.body',
            minHeight: '100vh'
        }}>
            <Box sx={{ mb: 3 }}>
                <Typography level="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Analytics & Splits
                </Typography>
                <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                    Analyze expenses, view reports, and calculate settlements
                </Typography>
            </Box>

            {/* Filter Panel */}
            <FilterPanel 
                filters={filters}
                members={members}
                onFilterChange={handleFilterChange}
            />

            {/* Overview Content - Tabs temporarily hidden */}
            {mounted && (
                <AnalyticsOverview
                    expenses={filteredData.expenses}
                    payments={filteredData.payments}
                    members={members}
                    filters={filters}
                    roomId={roomId}
                />
            )}

            {/* Tabs - Hidden for now */}
            {/* 
            <Tabs value={activeTab} onChange={handleTabChange}>
                <TabList sx={{ mb: 3 }}>
                    <Tab>Overview</Tab>
                    <Tab>Charts</Tab>
                    <Tab>Splits</Tab>
                    <Tab>Reports</Tab>
                </TabList>

                <TabPanel value={0}>
                    <AnalyticsOverview 
                        expenses={filteredData.expenses}
                        payments={filteredData.payments}
                        members={members}
                        filters={filters}
                    />
                </TabPanel>

                <TabPanel value={1}>
                    <ExpenseCharts 
                        expenses={filteredData.expenses}
                        payments={filteredData.payments}
                        members={members}
                        filters={filters}
                    />
                </TabPanel>

                <TabPanel value={2}>
                    <SplitCalculator 
                        expenses={filteredData.expenses}
                        payments={filteredData.payments}
                        members={members}
                        filters={filters}
                        roomId={roomId}
                    />
                </TabPanel>

                <TabPanel value={3}>
                    <ReportGenerator 
                        expenses={filteredData.expenses}
                        payments={filteredData.payments}
                        members={members}
                        filters={filters}
                        roomId={roomId}
                    />
                </TabPanel>
            </Tabs>
            */}
        </Box>
    );
}