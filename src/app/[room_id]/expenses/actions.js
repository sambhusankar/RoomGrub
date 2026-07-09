'use server';

import { auth } from '@/auth';
import { backendJson } from '@/utils/backend';

export async function getRoomMembers(roomId) {
    try {
        const members = await backendJson(`/api/v1/rooms/${roomId}/members`);
        const userMap = {};
        (members || []).forEach(m => {
            if (m.email) userMap[m.email] = m.name || m.email;
        });
        return userMap;
    } catch {
        return {};
    }
}

export async function fetchPaginatedExpenses({ roomId, cursor = null, limit = 20, filters = {} }) {
    try {
        const session = await auth();
        if (!session) {
            return { success: false, error: 'Unauthorized', expenses: [], nextCursor: null, hasMore: false };
        }

        const params = new URLSearchParams();
        params.set('limit', String(limit));
        if (cursor) params.set('cursor', String(cursor));
        if (filters.settled === false) params.set('settled', 'false');
        if (filters.textSearch) params.set('search', filters.textSearch);
        if (filters.user) params.set('user_email', filters.user);
        if (filters.dateFrom) params.set('date_from', filters.dateFrom);
        if (filters.dateTo) params.set('date_to', filters.dateTo);

        const data = await backendJson(`/api/v1/rooms/${roomId}/expenses?${params.toString()}`);
        const items = data.items || [];
        const nextCursor = data.next_cursor ?? null;
        const hasMore = nextCursor !== null;

        const enrichedExpenses = items.map(e => ({
            ...e,
            Users: e.user_info || null,
            settledAt: e.settled_at || null,
        }));

        return { success: true, expenses: enrichedExpenses, nextCursor, hasMore };
    } catch (error) {
        return { success: false, error: error.detail, expenses: [], nextCursor: null, hasMore: false };
    }
}
