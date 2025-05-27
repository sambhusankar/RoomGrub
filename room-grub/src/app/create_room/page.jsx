'use client'
import React from 'react';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";

export default function Page() {
  const router = useRouter();
  const supabase = createClient();

  const createRoom = async () => {
    console.log("Creating a room ....");

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.error('Auth error:', error);
      return;
    }

    const user = session.user;

    const { data: room, error: insertError1 } = await supabase
      .from("Rooms")
      .insert({
        members: 1,
        admin: user.email
      })
      .select();

    if (insertError1 || !room || room.length === 0) {
      console.error("Insert failed:", insertError1);
      return;
    }

    console.log("Room inserted successfully:", room);

    const { error: insertError2 } = await supabase
      .from("Users")
      .update({
        room: room[0].id,
        role: 'Admin'
      })
      .eq('email', room[0].admin);

    if (insertError2) {
      console.error("User update failed:", insertError2);
      return;
    }

    console.log("User updated with room ID");
    router.push(room[0].id);
  };

  return (
    <div>
      <h2 className="font-bold m-3">You are not joined any room</h2>
      <div className="m-8 text-center">
        <Button
          sx={{
            backgroundColor: 'blue',
            color: 'white',
            padding: '5px 5px',
            fontWeight: 'bold',
            margin: '5px',
            '&:hover': {
              backgroundColor: 'darkblue'
            }
          }}
          onClick={createRoom}
        >
          Create & Manage Your Room
        </Button>
        <p>--------------------- OR ------------------------</p>
        <p className="m-5 text-gray">Tell your friend to add you as a member</p>
      </div>
    </div>
  );
}
