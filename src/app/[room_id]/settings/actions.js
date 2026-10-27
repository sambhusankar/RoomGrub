'use server';

import { forgetLastRoom } from '@/auth';
import { backendJson } from '@/utils/backend';

export async function deleteRoom(roomId) {
    try {
        await backendJson(`/api/v1/rooms/${roomId}`, { method: 'DELETE' });
        await forgetLastRoom(roomId);
        return { success: true };
    } catch (error) {
        const isPending = error.detail?.includes('unsettled');
        return { success: false, error: error.detail, pendingExists: isPending };
    }
}
