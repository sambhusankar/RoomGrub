import { auth } from '@/auth';
import { fetchRoomDashboard } from './actions';
import RoomDashboardPage from './_components/RoomDashboardPage';

export default async function Page({ params }) {
  const session = await auth();
  const { room_id } = await params;
  const firstName = session.user.name?.split(' ')[0] || 'there';
  const { totalRoomStats, memberStats } = await fetchRoomDashboard(room_id);

  return <RoomDashboardPage firstName={firstName} totalRoomStats={totalRoomStats} memberStats={memberStats} />;
}
