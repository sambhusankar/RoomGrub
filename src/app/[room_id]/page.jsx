import { auth } from '@/auth';
import { fetchRoomDashboard } from './homeActions';
import WelCome from './_components/WelCome';
import LazyNotificationPrompt from './_components/LazyNotificationPrompt';
import HomeDashboard from './_components/HomeDashboard';
import Box from '@mui/joy/Box';

export default async function Page({ params }) {
  const session = await auth();

  const { room_id } = await params;
  const firstName = session.user.user_metadata?.full_name?.split(' ')[0] || 'there';
  const { totalRoomStats, memberStats } = await fetchRoomDashboard(room_id);

  return (
    <Box sx={{ px: 2, py: 1 }}>
      <WelCome firstName={firstName} />
      <LazyNotificationPrompt />
      {totalRoomStats && (
        <HomeDashboard totalRoomStats={totalRoomStats} memberStats={memberStats} />
      )}
    </Box>
  );
}
