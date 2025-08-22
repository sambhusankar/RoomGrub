'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Box } from '@mui/material';
import FilterPanel from './FilterPanel';
import ExpensesList from './ExpensesList';

export default function ExpenseHistory() {
    const supabase = createClient();
    const param = useParams();
    const [filter, setFilter] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [userFilter, setUserFilter] = useState('');

    useEffect(() => {
        // Fetch Expenses from the database
        const fetchExpenses = async () => {
            try {
                const { data: Expenses, error: fetchError } = await supabase
                    .from("Spendings")
                    .select("*")
                    .eq("room", param.room_id);
                if (fetchError) throw fetchError;
                setExpenses(Expenses || []);
            } catch (error) {
                console.error('Error fetching Expenses:', error);
            }
        };

        fetchExpenses();
    }, [param.room_id]);

    // Get unique users for dropdown
    const uniqueUsers = Array.from(new Set(expenses.map(e => e.user))).filter(Boolean);

    // Apply all filters
    const filteredExpenses = expenses?.filter((expense) => {
        const matchesCategory = expense?.material?.toLowerCase().includes(filter.toLowerCase());
        const matchesUser = userFilter ? expense?.user === userFilter : true;
        const expenseDate = expense?.created_at?.substring(0, 10);
        const matchesFrom = dateRange.from ? expenseDate >= dateRange.from : true;
        const matchesTo = dateRange.to ? expenseDate <= dateRange.to : true;
        return matchesCategory && matchesUser && matchesFrom && matchesTo;
    }) || [];

    return (
        <Box
            sx={{
                p: 4,
                maxWidth: 500,
                mx: 'auto',
                bgcolor: 'background.paper',
                boxShadow: 3,
                borderRadius: 2,
            }}
        >
            <FilterPanel
                filter={filter}
                setFilter={setFilter}
                userFilter={userFilter}
                setUserFilter={setUserFilter}
                dateRange={dateRange}
                setDateRange={setDateRange}
                uniqueUsers={uniqueUsers}
            />
            <ExpensesList filteredExpenses={filteredExpenses} />
        </Box>
    );
}