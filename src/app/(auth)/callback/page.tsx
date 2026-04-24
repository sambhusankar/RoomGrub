'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { acceptInvite } from '@/app/invite/actions'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient()

      const params = new URLSearchParams(window.location.search)
      const inviteToken = params.get('invite_token')

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        console.error('Auth error:', error)
        return router.push('/login?message=Authentication failed')
      }

      const user = session.user

      const { data: existingUser, error: fetchError } = await supabase
        .from("Users")
        .select('*')
        .eq('uid', user.id)

      if (fetchError) {
        return router.push('/login?message=DB error')
      }

      if (existingUser.length === 0) {
        // New user — create record first with no room
        const { data: insertedUser, error: insertError } = await supabase
          .from("Users")
          .insert({
            uid: user.id,
            email: user.email,
            name: user.user_metadata.full_name || user.user_metadata.name || '',
            room: null,
            role: null,
            profile: user.user_metadata.avatar_url
          }).select()

        if (insertError) {
          console.error('Insert error:', insertError)
          return router.push('/login?message=DB error')
        }

        // If invite token present, accept it
        if (inviteToken) {
          const result = await acceptInvite(inviteToken)
          if (result.success) {
            return router.push(`/${result.roomId}`)
          }
        }

        return router.push('create_room')
      }

      // Existing user
      const existingUserData = existingUser[0]

      if (!existingUserData.room && inviteToken) {
        const result = await acceptInvite(inviteToken)
        if (result.success) {
          return router.push(`/${result.roomId}`)
        }
      }

      existingUserData.room
        ? router.push(`${existingUserData.room}`)
        : router.push('create_room')
    }

    handleAuth()
  }, [router])

  return <p>Logging in...</p>
}
