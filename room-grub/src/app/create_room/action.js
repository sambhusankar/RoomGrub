'use client'

import { useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";

export function PrepareRoom() {
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      console.log("Get into action");

      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("==========================");

      if (error || !session) {
        console.error('Auth error:', error);
        return;
      }

      console.log("Retrieved user session:", session.user.email);
      console.log("===========================");

      await insertRoom(session.user);
    };

    const insertRoom = async (user) => {
      const { error: insertError } = await supabase
        .from("Rooms")
        .insert({
          members: 1,
          admin: user.email
        });

      if (insertError) {
        console.error("Insert failed:", insertError);
      } else {
        console.log("Room inserted successfully");
      }
    };

    getSession();
  }, []);

  return null; // Or JSX if you need UI
}
