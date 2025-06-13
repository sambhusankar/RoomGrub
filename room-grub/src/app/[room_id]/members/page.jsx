'use server'
import { createClient } from '@/utils/supabase/server';
import ListMembers from './_components/ListMembers';
import { LoginRequired } from '@/policies/LoginRequired';

export default async function MembersPage({ params }) {
    const session = await LoginRequired();
    const supabase = await createClient();
    console.log("param is", params);
    const p = await params;
    console.log("params is", p);
    const { data: members, error } = await supabase
        .from("Users")
        .select("*")
        .eq("room", params.room_id);

    // Optionally handle error here

    return (
        <ListMembers members={members || []} roomId={params.room_id} />
    );
}