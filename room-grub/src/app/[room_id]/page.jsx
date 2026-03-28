import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import WelCome from './_components/WelCome';
import LazyNotificationPrompt from './_components/LazyNotificationPrompt';
import HomeDashboard from './_components/HomeDashboard';
import Box from '@mui/joy/Box';

export default async function Page() {
  const session = await auth();
  if (!session) redirect('/login');

  const firstName = session.user.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <Box sx={{ px: 2, py: 1 }}>
      <WelCome firstName={firstName} />
      <LazyNotificationPrompt />
      <HomeDashboard />
    </Box>
  );
}
