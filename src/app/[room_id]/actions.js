'use server';

import { auth } from '@/auth';
import { backendJson } from '@/utils/backend';

export async function fetchHomeSummary(roomId) {
    try {
        const session = await auth();
        if (!session) return { totalPurchases: 0, pendingAmount: 0, recentExpenses: [] };

        const data = await backendJson(`/api/v1/rooms/${roomId}`);
        return {
            totalPurchases: data.total_spent ?? 0,
            pendingAmount: data.pending_amount ?? 0,
            recentExpenses: (data.recent_expenses || []).map(e => ({
                ...e,
                Users: null,
                settledAt: null,
            })),
        };
    } catch {
        return { totalPurchases: 0, pendingAmount: 0, recentExpenses: [] };
    }
}

export async function fetchRoomDashboard(roomId) {
    try {
        const session = await auth();
        if (!session) return { totalRoomStats: null, memberStats: [] };

        const [data, summary] = await Promise.all([
            backendJson(`/api/v1/rooms/${roomId}/dashboard`),
            fetchHomeSummary(roomId),
        ]);
        const members = data.members || [];

        const memberStats = members.map(m => ({
            member: {
                id: m.user_id,
                email: m.email,
                name: m.name || '',
                profile: m.profile || null,
                role: m.role,
            },
            totalPurchases: m.total_spent ?? 0,
            pendingAmount: m.pending_amount ?? 0,
            status: (m.pending_amount ?? 0) > 0 ? 'pending' : 'settled',
        }));

        const totalRoomStats = {
            totalPurchases: summary.totalPurchases,
            pendingPayments: summary.pendingAmount,
        };

        return { totalRoomStats, memberStats };
    } catch {
        return { totalRoomStats: null, memberStats: [] };
    }
}
