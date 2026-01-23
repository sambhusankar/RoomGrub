import ListOptions from './_components/ListOptions';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import WelCome from './_components/WelCome';
import LazyNotificationPrompt from './_components/LazyNotificationPrompt';

export default async function Page({ params }) {
  const session = await LoginRequired();
  const userData = await validRoom({ params });

  return (
    <>
      <WelCome session={session} />
      <LazyNotificationPrompt />
      <ListOptions params={params} userRole={userData?.role} />
    </>
  );
}