import React from 'react';
import { createClient } from '@/utils/supabase/server';
import ListMembers from './_components/ListMembers';
import { LoginRequired } from '@/policies/LoginRequired';

export default async function MembersPage({ params }) {
    const session = await LoginRequired();
    const param = await params;
    const supabase = await createClient();
    const { data: members, error } = await supabase
        .from("Users")
        .select("*")
        .eq("room", param.room_id);

    // Optionally handle error here

    return (
        <ListMembers members={members || []} roomId={param.room_id} />
    );
}