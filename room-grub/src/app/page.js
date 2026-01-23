'server-only'
import { redirect } from 'next/navigation';
import { LoginRequired } from '@/policies/LoginRequired'
import { getUserRoom } from '@/auth';

export default async function Home() {
  const session = await LoginRequired()
  if (session) {
    // Use cached getUserRoom instead of separate query
    const { data, error } = await getUserRoom(session.user.email);
    if (error) {
      console.error('Error fetching user data:', error);
      return redirect('/create_room');
    }
    if (data?.room) {
      redirect(`/${data.room}`)
    } else {
      redirect('/create_room')
    }
  }
}