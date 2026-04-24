'use server'
import { createClient } from '@/utils/supabase/server';
import ListMembers from './_components/ListMembers';
import { auth } from '@/auth';

export default async function MembersPage({ params }) {
    const session = await auth();
    const supabase = await createClient();
    const p = await params;
    const { data: members, error } = await supabase
        .from("Users")
        .select("*")
        .eq("room", params.room_id);

    // Optionally handle error here

    return (
        <ListMembers members={members || []} roomId={params.room_id} currentUserEmail={session.user.email} />
    );
}