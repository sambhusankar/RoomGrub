'server-only'
import NavBar from './NavBar'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export default async function NavBarContainer({ children }) {
  const session = await auth()

  async function signOutFn() {
    'use server'
    const result = await signOut()
    if (result) {
      redirect('/login');
    }
  }

  return (
    <div className="min-h-screen w-full">
      <NavBar user={session?.user} signOut={signOutFn} />
      <main>{children}</main>
    </div>
  )
}