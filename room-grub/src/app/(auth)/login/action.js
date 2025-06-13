'use server'
import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'
import DB from '../../../database/index.js'

export async function signInWithGoogle() {
  await DB.sequelize.authenticate();
  console.log("database authenticated")
  const supabase = await createClient();
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
  if (!data || !data.url) {
    console.error("OAuth Data Missing:", data);
    return redirect('/login?message=Authentication failed');
  }

  

  
  // Ensure session retrieval happens after OAuth redirect

  return redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
