'server-only'

import { auth, getUserRoom } from '@/auth'
import { redirect } from 'next/navigation'

export const validRoom = async ({ params }) => {
  const session = await auth() // Uses cached auth
  const roomId = (await params).room_id

  const PUBLIC_FILES = [
    'manifest.webmanifest',
    'favicon.ico',
    'robots.txt',
    'sitemap.xml',
  ]
  if (PUBLIC_FILES.includes(roomId)) {
    return null // Allow access to public files
  }
  if (session) {
    // Use cached getUserRoom instead of separate query
    const { data: room, error } = await getUserRoom(session.user.email)

    if (error || !room) {
      console.log('Error fetching room:', error)
      redirect('/login')
    }

    if (room.room != roomId) {
      redirect('/login')
    }

    // Return user data so it can be reused by caller
    return { room: room.room, role: room.role }
  }

  return null
}

