'use server';

import { backendJson } from '@/utils/backend';

export async function getMemberData(roomId, memberId) {
    try {
        const data = await backendJson(`/api/v1/rooms/${roomId}/members/${memberId}`);
        return {
            member: {
                id: data.user_id,
                email: data.email,
                name: data.name || '',
                profile: data.profile || null,
                role: data.role,
            },
            purchases: (data.expenses || []).map(e => ({
                ...e,
                Users: { email: data.email, name: data.name },
            })),
            summary: {
                pendingAmount: data.pending_amount ?? 0,
                totalPurchases: data.total_spent ?? 0,
            },
        };
    } catch {
        return { member: null, purchases: [], summary: { pendingAmount: 0, totalPurchases: 0 } };
    }
}
