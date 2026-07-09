'use client';

import useUserRole from '@/hooks/useUserRole';
import { useParams } from 'next/navigation';
import AddGrocery from './AddGroccery';

export default function AddGroceryPage() {
  const { room_id } = useParams();
  const { role } = useUserRole(room_id);

  return <AddGrocery userRole={role} />;
}
