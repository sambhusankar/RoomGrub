'use server'
import CreateRoom from './_components/CreateRoom'
import { LoginRequired } from '@/policies/LoginRequired';


export default async function Page() {
  const session = await LoginRequired();
  return (
    <CreateRoom />
  );
}
