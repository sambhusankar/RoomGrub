import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import LandingPage from './_components/LandingPage';

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect('/rooms');
  }
  return <LandingPage />;
}
