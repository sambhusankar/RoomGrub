'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { backendJson } from '@/utils/backend';

export async function getSplitsData(roomId) {
    try {
        const data = await backendJson(`/api/v1/rooms/${roomId}/splits`);
        return {
            expenses: data.unsettled_expenses || [],
            members: (data.members || []).map(m => ({
                id: m.user_id ?? m.user_email,
                email: m.user_email,
                name: m.name || '',
                profile: m.profile || null,
                role: m.role,
                pending_amount: m.pending_amount ?? 0,
                total_spent: m.total_spent ?? 0,
            })),
            settlements: (data.settlements || []).map(s => ({
                fromEmail: s.from_user_email,
                fromName: s.from_name || s.from_user_email,
                toEmail: s.to_user_email,
                toName: s.to_name || s.to_user_email,
                amount: s.amount,
            })),
        };
    } catch {
        return { expenses: [], members: [], settlements: [] };
    }
}

// Settling always closes out every member's balance for the whole room —
// the backend's settle-all has no date/member scoping (settle_all_room()
// is unconditional), so this must always be called with the FULL,
// unfiltered member list, never a filtered subset, or members left out
// of the payload would still get silently settled server-side while the
// UI implied they weren't touched.
export async function settleAllPending(roomId, memberBalances) {
    try {
        const session = await auth();
        if (!session) return { success: false, error: 'Unauthorized' };

        const pendingMembers = (memberBalances || []).filter(mb => Math.abs(mb.balance) > 0.01);
        if (pendingMembers.length === 0) return { success: false, error: 'No pending settlements to process' };

        const members = pendingMembers.map(mb => ({
            user_email: mb.member.email,
            pending_amount: mb.balance,
        }));

        await backendJson(`/api/v1/rooms/${roomId}/splits/settle-all`, {
            method: 'POST',
            body: JSON.stringify({ members }),
        });

        revalidatePath(`/${roomId}`, 'layout');
        return { success: true, settledCount: pendingMembers.length };
    } catch (error) {
        return { success: false, error: error.detail };
    }
}
