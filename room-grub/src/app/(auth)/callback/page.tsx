'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  let newUser = undefined;
  console.log('inside callback')
  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        console.error('Auth error:', error)
        return router.push('/login?message=Authentication failed')
      }

      const user = session.user

      // Check if user exists in custom `users` table
      const { data: existingUser, error: fetchError } = await supabase
        .from("Users")
        .select('*')
        .eq('uid', user.id)

    console.log("==================================")

      if (existingUser.length == 0 && fetchError == null) {
        // Insert new user into `users` table
        console.log("No existing user ")
        const {data: inviteData, error: inviteError } = await supabase
        .from("Invite")
        .select('*')
        .eq('email', user.email)

        console.log(inviteData, inviteError)

        const { data: InsertedUser, error: insertError } = await supabase
          .from("Users")
          .insert({
            uid: user.id,
            email: user.email,
            name: user.user_metadata.full_name || user.user_metadata.name || '',
            room: inviteData.length != 0 ? inviteData[0]?.room : null ,
            role: inviteData.length != 0 ? 'Member' : null,
            profile: user.user_metadata.avatar_url
          }).select()
        newUser = InsertedUser;
        if (insertError) {
          console.error('Insert error:', insertError)
          return router.push('/login?message=DB error')
        }else{
            console.log("User inserrted successfully")

            // If user joined via invite, increment room members count and delete invite
            if (inviteData.length != 0) {
              const roomId = inviteData[0].room;

              // Increment room members count
              const { data: roomData, error: roomFetchError } = await supabase
                .from('Rooms')
                .select('members')
                .eq('id', roomId)
                .single()

              if (!roomFetchError && roomData) {
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
                .eq('email', user.email)

              if (deleteError) {
                console.error('Error deleting invite:', deleteError)
              } else {
                console.log("Invite entry deleted successfully")
              }
            }
        }
      }

      // Redirect user after login
      if(newUser){
        newUser[0]?.room ? router.push(`${newUser[0]?.room}`) : router.push('create_room')
      }else{
        existingUser[0]?.room ? router.push(`${existingUser[0]?.room}`) : router.push('create_room')
    }}

    handleAuth()
  }, [router])

  return <p>Logging in...</p>
}
