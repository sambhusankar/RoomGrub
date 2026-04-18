'use client';

import { useOfflineAuth } from '@/hooks/useOfflineAuth';
import useUserRole from '@/hooks/useUserRole';
import AddGrocery from './_components/AddGroccery';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';

export default function Page() {
  const { loading, isAuthenticated } = useOfflineAuth();
  const { role } = useUserRole();

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

  if (!isAuthenticated) {
    return null;
  }

  return <AddGrocery userRole={role} />;
}
