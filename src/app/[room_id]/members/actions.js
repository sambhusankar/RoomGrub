'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { backendJson } from '@/utils/backend';

export async function getMembers(roomId) {
    try {
        const members = await backendJson(`/api/v1/rooms/${roomId}/members`);
        return members || [];
    } catch {
        return [];
    }
}

async function findMemberIdByEmail(roomId, email) {
    const members = await backendJson(`/api/v1/rooms/${roomId}/members`);
    const member = (members || []).find(m => m.email === email);
    return member?.user_id ?? null;
}

export async function updateMemberRole(roomId, memberEmail, newRole) {
    try {
        const session = await auth();
        if (!session) return { success: false, error: 'Unauthorized' };

        const memberId = await findMemberIdByEmail(roomId, memberEmail);
        if (!memberId) return { success: false, error: 'Member not found' };

        await backendJson(`/api/v1/rooms/${roomId}/members/${memberId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role: newRole }),
        });

        revalidatePath(`/${roomId}`, 'layout');
        return { success: true, message: `Successfully updated ${memberEmail} to ${newRole}` };
    } catch (error) {
        return { success: false, error: error.detail };
    }
}

export async function removeMember(roomId, memberEmail) {
    try {
        const session = await auth();
        if (!session) return { success: false, error: 'Unauthorized' };

        const memberId = await findMemberIdByEmail(roomId, memberEmail);
        if (!memberId) return { success: false, error: 'Member not found' };

        await backendJson(`/api/v1/rooms/${roomId}/members/${memberId}`, { method: 'DELETE' });

        revalidatePath(`/${roomId}`, 'layout');
        return { success: true, message: `Successfully removed ${memberEmail} from the room` };
    } catch (error) {
        return { success: false, error: error.detail };
    }
}

export async function exitRoom(roomId) {
    try {
        await backendJson(`/api/v1/rooms/${roomId}/members/me`, { method: 'DELETE' });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.detail };
    }
}
