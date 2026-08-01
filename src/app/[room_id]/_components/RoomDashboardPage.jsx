import Box from '@mui/joy/Box';
import WelCome from './WelCome';
import HomeDashboard from './HomeDashboard';

export default function RoomDashboardPage({ firstName, totalRoomStats, memberStats }) {
  return (
    <Box sx={{ px: 2, py: 1 }}>
      <WelCome firstName={firstName} />
      {totalRoomStats && (
        <HomeDashboard totalRoomStats={totalRoomStats} memberStats={memberStats} />
      )}
    </Box>
  );
}
