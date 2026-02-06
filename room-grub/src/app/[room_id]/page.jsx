'use client';

import { useParams } from 'next/navigation';
import { useOfflineAuth } from '@/hooks/useOfflineAuth';
import useUserRole from '@/hooks/useUserRole';
import ListOptions from './_components/ListOptions';
import WelCome from './_components/WelCome';
import LazyNotificationPrompt from './_components/LazyNotificationPrompt';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';

export default function Page() {
  const params = useParams();
  const { session, loading, isAuthenticated } = useOfflineAuth();
  const { role } = useUserRole();

  // Show loading state while checking auth
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, useOfflineAuth will redirect to /login
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <WelCome session={session} />
      <LazyNotificationPrompt />
      <ListOptions params={params} userRole={role} />
    </>
  );
}
