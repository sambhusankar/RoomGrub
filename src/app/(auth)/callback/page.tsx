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
