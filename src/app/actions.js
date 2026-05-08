'use server';

import { createClient } from '@/utils/supabase/server';
import { auth } from '@/auth';

export async function getUserRooms() {
    const session = await auth();
    if (!session) return { rooms: [], firstName: '' };

    const firstName = session.user.user_metadata?.full_name?.split(' ')[0] || 'there';
    const supabase = await createClient();

    const { data: userRecord } = await supabase
        .from('Users').select('id').eq('email', session.user.email).single();

    if (!userRecord) return { rooms: [], firstName };

    const { data: memberships } = await supabase
        .from('UserRooms')
        .select('room_id, role, Rooms(id, admin, members)')
        .eq('user_id', userRecord.id);

    const rooms = (memberships || []).map(m => ({
        id: m.room_id,
        role: m.role,
        ...m.Rooms,
    }));

    return { rooms, firstName };
}
