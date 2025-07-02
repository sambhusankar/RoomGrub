'use server'
import DB from '@/database';
import async from 'async';
import { redirect } from 'next/navigation';
const workflow = {
    insertRoom: async () => {
      // Create a new room and return the created room instance
      const newRoom = await DB.Room.create({
        members: 1,
        admin: session.user.email
      });
      return newRoom;
    },
    updateUser: async (roomId) => {
      // Update the user with the new room and role
      await DB.User.update(
        { room: roomId, role: 'Admin' },
        { where: { email: session.user.email } }
      );
    }
  };
  const results = async.auto(workflow);

  const createRoom = async () => {
    console.log("Creating a room ....");
    if (!session) {
      console.error('Auth error: No session');
      return;
    }

    // Use the workflow to insert the room and update the user in the database
    const newRoom = results.insertRoom();

    if (!newRoom || !newRoom.id) {
      console.error("Room creation failed in DB.");
      return;
    }

    results.updateUser(newRoom.id);
    console.log("Room inserted successfully:", newRoom);

    redirect(newRoom.id.toString());
  };