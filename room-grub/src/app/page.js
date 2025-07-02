'server only'
import {redirect} from 'next/navigation';
import { LoginRequired } from '@/policies/LoginRequired'
import { createClient } from '@/utils/supabase/client';

export default async function Home(){
  const session = await LoginRequired()
  if(session){
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('email', session.user.email)
      .single();
    if (error) {
      console.error('Error fetching user data:', error);
      return redirect('/create_room');
    }
    if (data?.room) {
      redirect(`/${data?.room}`)
    }
    else{
      redirect('/create_room')
    }
  }
}