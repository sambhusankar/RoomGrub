'use server'
import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'
import { console } from 'inspector';
//import db from '../../../database/index.js'

export async function login() {
  console.log('logging in')
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

  // try{
  //   await db.User.findOrCreate({
  //     where: {email: user.email},
  //       defaults: {
  //         email: user.email,
  //         name: user.name
  //       }
  // })
  // }catch(err){
  //   console.log('error storing user in db', err)
  // }
  console.log('data',data);
  console.log('error',error)
  return redirect(data.url || 2)
  }

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}