'server-only'

import { auth, getUserRoomForRoom } from '@/auth'
import { redirect } from 'next/navigation'

export const validRoom = async ({ params }) => {
  const session = await auth()
  const roomId = (await params).room_id

  const PUBLIC_FILES = [
    'manifest.webmanifest',
    'favicon.ico',
    'robots.txt',
    'sitemap.xml',
  ]
  if (PUBLIC_FILES.includes(roomId)) {
    return null
  }

  if (session) {
    const { data: membership, error } = await getUserRoomForRoom(session.user.email, roomId)

    if (error || !membership) {
      redirect('/')
    }

    return { room: membership.room_id, role: membership.role }
  }

  return null
}
