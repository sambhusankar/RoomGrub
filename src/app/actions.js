'use server';

import { auth } from '@/auth';
import { backendJson } from '@/utils/backend';

export async function getUserRooms() {
    const session = await auth();
    if (!session) return { rooms: [], firstName: '' };

    const firstName = session.user.name?.split(' ')[0] || 'there';

    try {
        const rooms = await backendJson('/api/v1/rooms');
        return { rooms: rooms || [], firstName };
    } catch {
        return { rooms: [], firstName, error: true };
    }
}
