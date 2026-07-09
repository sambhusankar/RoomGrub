'use server';

import { revalidatePath } from 'next/cache';
import { backendJson } from '@/utils/backend';

export async function validateToken(token) {
    try {
        const data = await backendJson(`/api/v1/invites/${token}`);
        return {
            valid: true,
            invite: {
                id: data.token,
                token: data.token,
                room: { id: data.room_id },
                invitedBy: { email: data.invited_by_email, name: data.invited_by_name },
                daysLeft: data.days_left,
            }
        };
    } catch (err) {
        const status = err.detail?.includes('expired') ? 'expired'
            : err.detail?.includes('accepted') ? 'accepted'
            : err.detail?.includes('rejected') ? 'rejected'
            : 'not_found';
        return { valid: false, reason: status };
    }
}

export async function createInvite(roomId) {
    try {
        const data = await backendJson(`/api/v1/rooms/${roomId}/invites`, { method: 'POST' });
        return { success: true, token: data.token };
    } catch (error) {
        return { success: false, error: error.detail };
    }
}

export async function acceptInvite(token) {
    try {
        const data = await backendJson(`/api/v1/invites/${token}/accept`, { method: 'POST' });
        revalidatePath(`/${data.room_id}`, 'layout');
        return { success: true, roomId: data.room_id };
    } catch (error) {
        return { success: false, error: error.detail };
    }
}

export async function rejectInvite(token) {
    try {
        await backendJson(`/api/v1/invites/${token}/reject`, { method: 'POST' });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.detail };
    }
}
