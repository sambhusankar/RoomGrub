'use client';

import { useOfflineAuth } from '@/hooks/useOfflineAuth';
import useUserRole from '@/hooks/useUserRole';
import { useParams } from 'next/navigation';
import AddGrocery from './AddGroccery';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';

export default function AddGroceryPage() {
  const { room_id } = useParams();
  const { loading, isAuthenticated } = useOfflineAuth();
  const { role } = useUserRole(room_id);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) return null;

  return <AddGrocery userRole={role} />;
}
