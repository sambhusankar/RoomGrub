'use server'
import { createClient } from '@/utils/supabase/server';
import ListMembers from './_components/ListMembers';
import { auth } from '@/auth';

export default async function MembersPage({ params }) {
    const session = await auth();
    const supabase = await createClient();
    const p = await params;

    const { data: memberships, error } = await supabase
        .from('UserRooms')
        .select('role, Users(*)')
        .eq('room_id', p.room_id);

    const members = (memberships || []).map(m => ({ ...m.Users, role: m.role }));

    return (
        <ListMembers members={members} roomId={p.room_id} currentUserEmail={session.user.email} />
    );
}
