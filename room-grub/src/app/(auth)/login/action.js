'use server'
import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'

export async function login() {
  console.log('logging in')
  const supabase = await createClient();
  console.log(supabase)
  const redirectUrl = '/auth/callback';
  const provider = 'google';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
        redirectTo: redirectUrl,
    }
  })

  if (error) {
      redirect('/login?message=Could not authenticate user')
  }

  console.log('data',data);
  console.log('error',error)
  return redirect(data.url)
  }

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}