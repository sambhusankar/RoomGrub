'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Typography } from '@mui/joy';
import { Box, CircularProgress } from '@mui/joy';
import FilterPanel from './FilterPanel';
import ExpenseCard from './ExpenseCard';
import { fetchPaginatedExpenses } from '../actions';

export default function ExpenseHistory({ initialExpenses, initialCursor, initialHasMore, roomId, userMap }) {
    const [expenses, setExpenses] = useState(initialExpenses);
    const [cursor, setCursor] = useState(initialCursor);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);

    const [filter, setFilter] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [userFilter, setUserFilter] = useState('');

    const observerTarget = useRef(null);

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Group expenses by month
    const groupExpensesByMonth = (expenses) => {
        const groups = {};
        expenses.forEach(expense => {
            const date = new Date(expense.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

            if (!groups[monthKey]) {
                groups[monthKey] = {
                    monthKey,
                    monthName,
                    expenses: [],
                    total: 0
                };
            }
            groups[monthKey].expenses.push(expense);
            groups[monthKey].total += parseFloat(expense.money);
        });

        return Object.values(groups).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
    };

    const groupedExpenses = groupExpensesByMonth(expenses);

    // Load more expenses (next page)
    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const result = await fetchPaginatedExpenses({
            roomId,
            cursor,
            limit: 20,
            filters: {
                textSearch: filter,
                user: userFilter,
                dateFrom: dateRange.from,
                dateTo: dateRange.to,
            },
        });

        if (result.success) {
            setExpenses(prev => [...prev, ...result.expenses]);
            setCursor(result.nextCursor);
            setHasMore(result.hasMore);
        }
        setLoading(false);
    }, [loading, hasMore, cursor, roomId, filter, userFilter, dateRange]);

    // Fetch fresh results when filters change
    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            // Skip on initial render (no filters applied)
            if (!filter && !userFilter && !dateRange.from && !dateRange.to) {
                setExpenses(initialExpenses);
                setCursor(initialCursor);
                setHasMore(initialHasMore);
                return;
            }

            setLoading(true);
            const result = await fetchPaginatedExpenses({
                roomId,
                cursor: null,
                limit: 20,
                filters: {
                    textSearch: filter,
                    user: userFilter,
                    dateFrom: dateRange.from,
                    dateTo: dateRange.to,
                },
            });

            if (result.success) {
                setExpenses(result.expenses);
                setCursor(result.nextCursor);
                setHasMore(result.hasMore);
            }
            setLoading(false);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [filter, userFilter, dateRange, roomId]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.5 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading, loadMore]);

    return (
        <Box sx={{
            bgcolor: '#f8f9fa',
            minHeight: '100vh',
            pt: 2,
        }}>
            <Box sx={{ px: 2 }}>
                <FilterPanel
                    filter={filter}
                    setFilter={setFilter}
                    userFilter={userFilter}
                    setUserFilter={setUserFilter}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    userMap={userMap}
                />
            </Box>

            {expenses.length === 0 && !loading ? (
                <Box sx={{
                    textAlign: 'center',
                    mt: 8,
                    py: 6,
                    mx: 2,
                    bgcolor: 'background.surface',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.06)',
                }}>
                    <Box sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: 'neutral.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}>
                        <Typography level="h3" sx={{ color: 'neutral.400' }}>
                            💸
                        </Typography>
                    </Box>
                    <Typography level="title-sm" sx={{ color: 'text.primary', mb: 1 }}>
                        No expenses found
                    </Typography>
                    <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                        Try adjusting your filters or add a new expense
                    </Typography>
                </Box>
            ) : (
                <>
                    {groupedExpenses.map((group) => (
                        <Box key={group.monthKey} sx={{ mb: 3 }}>
                            {/* Month Header */}
                            <Box sx={{
                                px: 2,
                                py: 2,
                                bgcolor: 'background.surface',
                                borderBottom: '1px solid rgba(0,0,0,0.06)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <Typography
                                    level="title-md"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'text.primary',
                                    }}
                                >
                                    {group.monthName}
                                </Typography>
                                <Typography
                                    level="title-sm"
                                    sx={{
                                        fontWeight: 700,
                                        color: 'text.primary',
                                    }}
                                >
                                    {formatAmount(group.total)}
                                </Typography>
                            </Box>

                            {/* Month's Expenses */}
                            <Box sx={{ bgcolor: 'background.surface' }}>
                                {group.expenses.map((expense, index) => (
                                    <Box key={expense.id}>
                                        <ExpenseCard
                                            user={expense.Users?.name || expense.user || 'Unknown User'}
                                            amount={parseFloat(expense.money)}
                                            date={expense.created_at}
                                            material={expense.material}
                                            userProfile={expense.Users?.profile}
                                            sx={{
                                                mx: 0,
                                                my: 0,
                                                boxShadow: 'none',
                                                border: 'none',
                                                bgcolor: 'transparent',
                                                borderRadius: 0,
                                                '&:hover': {
                                                    bgcolor: 'background.level1',
                                                },
                                            }}
                                        />
                                        {index < group.expenses.length - 1 && (
                                            <Box sx={{
                                                height: 1,
                                                bgcolor: 'divider',
                                                mx: 2,
                                                opacity: 0.3,
                                            }} />
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ))}

                    {/* Loading spinner */}
                    {loading && (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <CircularProgress size="sm" />
                        </Box>
                    )}

                    {/* Scroll sentinel for Intersection Observer */}
                    {hasMore && <div ref={observerTarget} style={{ height: 20 }} />}

                    {/* End of list indicator */}
                    {!hasMore && expenses.length > 0 && (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                                No more expenses
                            </Typography>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
