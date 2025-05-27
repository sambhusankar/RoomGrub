'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        console.error('Auth error:', error)
        return router.push('/login?message=Authentication failed')
      }

      const user = session.user
      console.log("==========================");
      console.log(user);

      // Check if user exists in custom `users` table
      const { data: existingUser, error: fetchError } = await supabase
        .from("Users")
        .select('*')
        .eq('uid', user.id)

    console.log("==================================")
    console.log(existingUser, fetchError)
      if (existingUser.length == 0 && fetchError == null) {
        // Insert new user into `users` table
        console.log("No existing user ")
        const {data: inviteData, error: inviteError } = await supabase
        .from("Invite")
        .select('*')
        .eq('email', user.email)

        console.log(inviteData, inviteError)

        const { data: newUser, error: insertError } = await supabase
          .from("Users")
          .insert({
            uid: user.id,
            email: user.email,
            name: user.user_metadata.full_name || user.user_metadata.name || '',
            room: inviteData.length != 0 ? inviteData[0]?.room : null ,
            role: inviteData.length != 0 ? 'Member' : null,
          }).select()

        if (insertError) {
          console.error('Insert error:', insertError)
          return router.push('/login?message=DB error')
        }else{
            console.log("User inserrted successfully")
        }
      }

      // Redirect user after login
      console.log(newUser);
      existingUser[0]?.room ? router.push(`${existingUser[0]?.room}`) : router.push('create_room')
    }

    handleAuth()
  }, [router])

  return <p>Logging in...</p>
}
