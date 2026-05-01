import dynamic from 'next/dynamic';
import { auth, getUserRoomForRoom } from '@/auth';
import { createClient } from '@/utils/supabase/server';

// Lazy load the heavy splits dashboard
const SplitsDashboard = dynamic(() => import('./_components/SplitsDashboard'));

export default async function SplitsPage({ params }) {
  const session = await auth();
  const roomId = (await params).room_id;
  const { data: membership } = await getUserRoomForRoom(session.user.email, roomId);

  const supabase = await createClient();

  // Run all queries in parallel for better performance
  const [expensesResult, paymentsResult, membershipsResult] = await Promise.all([
    supabase
      .from('Spendings')
      .select(`*, Users(name, email, profile)`)
      .eq('room', roomId)
      .or('settled.is.null,settled.eq.false')
      .order('created_at', { ascending: false }),
    supabase
      .from('balance')
      .select('user, amount, status, spending_id')
      .eq('room', roomId)
      .eq('status', 'debit')
      .is('spending_id', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('UserRooms')
      .select('role, Users(*)')
      .eq('room_id', roomId)
  ]);

  if (expensesResult.error || paymentsResult.error || membershipsResult.error) {
    console.error('Error fetching splits data:', {
      expensesError: expensesResult.error,
      paymentsError: paymentsResult.error,
      membersError: membershipsResult.error
    });
    return <div className="p-4 text-red-500">Error loading splits data</div>;
  }

  const members = (membershipsResult.data || []).map(m => ({ ...m.Users, role: m.role }));

  return (
    <SplitsDashboard
      expenses={expensesResult.data || []}
      payments={paymentsResult.data || []}
      members={members}
      roomId={roomId}
      userRole={membership?.role ?? null}
    />
  );
}
