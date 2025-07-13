'use server'
import DB from '@/database';
import async from 'async';
import { redirect } from 'next/navigation';
import { LoginRequired } from '@/policies/LoginRequired';
const workflow = {
    insertRoom: async (session) => {
      // Create a new room and return the created room instance
      const newRoom = await DB.Room.create({
        members: 1,
        admin: session.user.email
      });
      return newRoom;
    },
    updateUser: async (roomId, session) => {
      // Update the user with the new room and role
      await DB.User.update(
        { room: roomId, role: 'Admin' },
        { where: { email: session.user.email } }
      );
    }
  };

export const createRoom = async () => {
    console.log("Creating a room ....");
    const session = await LoginRequired();
    console.log(session);
    if (!session) {
      console.error('Auth error: No session');
      return;
    }
    //const results = await async.auto(workflow);
    // Use the workflow to insert the room and update the user in the database
    const newRoom = await DB.Room.create({
        members: 1,
        admin: session.user.email
      });

    if (!newRoom || !newRoom.id) {
      console.error("Room creation failed in DB.");
      return;
    }
    const roomId = newRoom.id;
    await DB.User.update(
        { room: roomId, role: 'Admin' },
        { where: { email: session.user.email } }
      );
    console.log("Room inserted successfully:", newRoom);

    redirect(`/${roomId.toString()}`);
};