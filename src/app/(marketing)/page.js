import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LAST_ROOM_COOKIE } from '@/auth/constants';
import LandingPage from './_components/LandingPage';

export default async function Home() {
  const session = await auth();
  if (session) {
    // A room the user no longer belongs to is bounced to /rooms by validRoom.
    const lastRoom = (await cookies()).get(LAST_ROOM_COOKIE)?.value;
    redirect(/^\d+$/.test(lastRoom) ? `/${lastRoom}` : '/rooms');
  }
  return <LandingPage />;
}
