'server-only'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
export const validRoom = async ({ params }) => {
  const session = await auth()
  const roomId = await params.room_id

  if (session) {
    const supabase = await createClient()
    const { data: room, error } = await supabase
      .from('Users')
      .select('room')
      .eq('email', session.user.email)
      .single()

    if (error || !room) {
      console.log('Error fetching room:', error)
      redirect('/login')
    }

    if (room.room != roomId) {
      redirect('/login')
    }
  }

  return null
}

