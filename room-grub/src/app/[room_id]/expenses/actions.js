'use server';

import { createClient } from '@/utils/supabase/server';
import { auth, getUserRoom } from '@/auth';

export async function fetchPaginatedExpenses({ roomId, cursor = null, limit = 20, filters = {} }) {
    try {
        const session = await auth();
        if (!session) {
            return { success: false, error: 'Unauthorized', expenses: [], nextCursor: null, hasMore: false };
        }

        const { data: userRoom, error: roomError } = await getUserRoom(session.user.email);
        if (roomError || !userRoom || userRoom.room != roomId) {
            return { success: false, error: 'Unauthorized: Not a member of this room', expenses: [], nextCursor: null, hasMore: false };
        }

        const supabase = await createClient();

        let query = supabase
            .from('Spendings')
            .select('*')
            .eq('room', roomId)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(limit + 1);

        // Cursor-based pagination
        if (cursor) {
            query = query.or(
                `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
            );
        }

        // Server-side filters
        if (filters.textSearch) {
            query = query.ilike('material', `%${filters.textSearch}%`);
        }
        if (filters.user) {
            query = query.eq('user', filters.user);
        }
        if (filters.dateFrom) {
            query = query.gte('created_at', filters.dateFrom);
        }
        if (filters.dateTo) {
            query = query.lte('created_at', `${filters.dateTo}T23:59:59`);
        }

        const { data: expensesData, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const hasMore = expensesData.length > limit;
        const expenses = hasMore ? expensesData.slice(0, limit) : expensesData;

        const nextCursor = hasMore && expenses.length > 0
            ? { created_at: expenses[expenses.length - 1].created_at, id: expenses[expenses.length - 1].id }
            : null;

        // Enrich with user data
        const uniqueEmails = [...new Set(expenses.map(e => e.user))].filter(Boolean);
        let userMap = new Map();

        if (uniqueEmails.length > 0) {
            const { data: usersData } = await supabase
                .from('Users')
                .select('email, name, profile')
                .in('email', uniqueEmails);

            userMap = new Map(usersData?.map(u => [u.email, u]) || []);
        }

        const enrichedExpenses = expenses.map(expense => ({
            ...expense,
            Users: userMap.get(expense.user),
        }));

        return {
            success: true,
            expenses: enrichedExpenses,
            nextCursor,
            hasMore,
        };
    } catch (error) {
        console.error('Error fetching paginated expenses:', error);
        return { success: false, error: error.message, expenses: [], nextCursor: null, hasMore: false };
    }
}
