'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { LoginRequired } from '@/policies/LoginRequired';
import async from 'async';

export const createRoom = async () => {
  const session = await LoginRequired();
  const supabase = await createClient();

  console.log("Creating a room ....");
  console.log(session);

  if (!session) {
    console.error('Auth error: No session');
    return;
  }

  const workflow = {
    createRoom: async () => {
      const { data: newRoom, error: roomError } = await supabase
        .from('Rooms')
        .insert({
          members: 1,
          admin: session.user.email,
        })
        .select()
        .single();

      if (roomError) {
        console.error("Room creation failed:", roomError);
        throw roomError; // ❗Stop workflow if room creation fails
      }

      console.log("New Room created:", newRoom);
      return newRoom; // ✅ Return the created room
    },

    updateUser: ['createRoom', async (results) => {
      const newRoom = results.createRoom;

      const { data: updatedUser, error: userError } = await supabase
        .from('Users')
        .update({
          room: newRoom.id,
          role: 'Admin',
        })
        .eq('email', session.user.email)
        .single();

      if (userError) {
        console.error("User update failed:", userError);
        throw userError;
      }

      console.log("User updated successfully:", updatedUser);
      return updatedUser;
    }],
  };

    const results = await async.auto(workflow);
    const newRoom = results.createRoom;

    if (!newRoom) {
      console.error("Room creation returned null/undefined. Aborting redirect.");
      return;
    }
    redirect(`/${newRoom.id}`);
};
