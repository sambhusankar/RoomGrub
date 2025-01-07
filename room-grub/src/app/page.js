'server only'
import redirect from 'next/navigation';

export default function Home(){
  redirect(`/${room_id}`)
}