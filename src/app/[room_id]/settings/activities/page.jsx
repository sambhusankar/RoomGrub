import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import { getActivitiesData } from './actions';
import ActivitiesPage from './_components/ActivitiesPage';

export default async function Page({ params }) {
  const session = await LoginRequired();
  await validRoom({ params });
  const { room_id } = await params;
  const { activities, isAdmin, emailToName } = await getActivitiesData(room_id, session.user.email);

  return (
    <ActivitiesPage activities={activities} isAdmin={isAdmin} roomId={room_id} emailToName={emailToName} />
  );
}
