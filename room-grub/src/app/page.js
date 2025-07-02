'server only'
import {redirect} from 'next/navigation';
import { LoginRequired } from '@/policies/LoginRequired'

export default function Home(){
  const session = LoginRequired()
  redirect('/create_room')
}