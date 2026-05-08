'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { LoginRequired } from '@/policies/LoginRequired';
import async from 'async';

export const createRoom = async () => {
  const session = await LoginRequired();
  const supabase = await createClient();

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
        throw roomError;
      }
      return newRoom;
    },

    getUser: async () => {
      const { data: user, error } = await supabase
        .from('Users')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (error || !user) throw new Error('User not found');
      return user;
    },

    addMembership: ['createRoom', 'getUser', async (results) => {
      const { error } = await supabase
        .from('UserRooms')
        .insert({
          user_id: results.getUser.id,
          room_id: results.createRoom.id,
          role: 'Admin',
        });

      if (error) {
        console.error("Membership creation failed:", error);
        throw error;
      }
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
