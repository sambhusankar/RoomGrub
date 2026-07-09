'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { backendJson } from '@/utils/backend';

export async function getSplitsData(roomId) {
    try {
        const data = await backendJson(`/api/v1/rooms/${roomId}/splits`);
        return {
            expenses: data.unsettled_expenses || [],
            payments: [],
            members: (data.members || []).map(m => ({
                id: m.user_id ?? m.user_email,
                email: m.user_email,
                name: m.name || '',
                profile: m.profile || null,
                role: m.role,
                pending_amount: m.pending_amount ?? 0,
                total_spent: m.total_spent ?? 0,
            })),
        };
    } catch {
        return { expenses: [], payments: [], members: [] };
    }
}

export async function settleAllPending(roomId, memberBalances, filters = {}) {
    try {
        const session = await auth();
        if (!session) return { success: false, error: 'Unauthorized' };

        const pendingMembers = (memberBalances || []).filter(mb => Math.abs(mb.balance) > 0.01);
        if (pendingMembers.length === 0) return { success: false, error: 'No pending settlements to process' };

        const members = pendingMembers.map(mb => ({
            user_email: mb.member.email,
            pending_amount: mb.balance,
        }));

        // member_emails must cover every member the fair-share was computed over
        // (memberBalances is already scoped to activeMembers), not just those with
        // a nonzero balance, otherwise the server recomputes fair-share over the
        // wrong denominator (or, if null, returns 0 pending for everyone).
        const memberEmails = (memberBalances || []).map(mb => mb.member.email);

        // date_to is a date-only string; make it inclusive of the whole day
        // before sending, otherwise the backend's created_at <= date_to
        // comparison treats it as midnight and drops same-day expenses.
        let dateTo = filters.dateRange?.to || null;
        if (dateTo) {
            const d = new Date(dateTo);
            d.setHours(23, 59, 59, 999);
            dateTo = d.toISOString();
        }

        await backendJson(`/api/v1/rooms/${roomId}/splits/settle-all`, {
            method: 'POST',
            body: JSON.stringify({
                members,
                date_from: filters.dateRange?.from || null,
                date_to: dateTo,
                member_emails: memberEmails.length ? memberEmails : null,
            }),
        });

        revalidatePath(`/${roomId}`, 'layout');
        return { success: true, settledCount: pendingMembers.length };
    } catch (error) {
        return { success: false, error: error.detail };
    }
}
