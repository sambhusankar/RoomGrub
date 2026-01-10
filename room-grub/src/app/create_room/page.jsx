'use server'
import CreateRoom from './_components/CreateRoom'
import { LoginRequired } from '@/policies/LoginRequired';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';


export default async function Page() {
  const session = await LoginRequired();
  const supabase = await createClient();

  // Check if the user has a pending invite
  const { data: inviteData, error: inviteError } = await supabase
    .from("Invite")
    .select('*')
    .eq('email', session.user.email)

  if (!inviteError && inviteData && inviteData.length > 0) {
    // User has a pending invite, auto-join them to the room
    const roomId = inviteData[0].room;

    // Get current room data to increment members count
    const { data: roomData, error: roomFetchError } = await supabase
      .from('Rooms')
      .select('members')
      .eq('id', roomId)
      .single()

    if (roomFetchError) {
      console.error('Error fetching room:', roomFetchError)
    }

    // Update user with room and role
    const { error: updateError } = await supabase
      .from('Users')
      .update({
        room: roomId,
        role: 'Member',
      })
      .eq('email', session.user.email)

    if (!updateError) {
      // Increment room members count
      if (roomData) {
        const { error: roomUpdateError } = await supabase
          .from('Rooms')
          .update({
            members: roomData.members + 1
          })
          .eq('id', roomId)

        if (roomUpdateError) {
          console.error('Error updating room members count:', roomUpdateError)
        }
      }

      // Delete the invite entry
      const { error: deleteError } = await supabase
        .from("Invite")
        .delete()
        .eq('email', session.user.email)

      if (deleteError) {
        console.error('Error deleting invite:', deleteError)
      } else {
        console.log("Invite entry deleted successfully after auto-join")
      }

      // Redirect to the room
      redirect(`/${roomId}`)
    } else {
      console.error('Error updating user:', updateError)
    }
  }

  return (
    <CreateRoom />
  );
}
