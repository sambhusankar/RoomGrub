import dynamic from 'next/dynamic';
import { auth, getUserRoom } from '@/auth';
import { createClient } from '@/utils/supabase/server';

// Lazy load the heavy splits dashboard
const SplitsDashboard = dynamic(() => import('./_components/SplitsDashboard'));

export default async function SplitsPage({ params }) {
  const session = await auth();
  const { data: userData } = await getUserRoom(session.user.email);

  const supabase = await createClient();
  const roomId = (await params).room_id;

  // Run all queries in parallel for better performance
  const [expensesResult, paymentsResult, membersResult] = await Promise.all([
    supabase
      .from('Spendings')
      .select(`*, Users(name, email, profile)`)
      .eq('room', roomId)
      .or('settled.is.null,settled.eq.false') // unsettled: NULL (legacy) or explicitly false
      .order('created_at', { ascending: false }),
    supabase
      .from('balance')
      .select('user, amount, status, spending_id')
      .eq('room', roomId)
      .eq('status', 'debit')
      .is('spending_id', null) // legacy lump-sum records only — new per-expense debits excluded
      .order('created_at', { ascending: false }),
    supabase
      .from('Users')
      .select('*')
      .eq('room', roomId)
  ]);

  if (expensesResult.error || paymentsResult.error || membersResult.error) {
    console.error('Error fetching splits data:', {
      expensesError: expensesResult.error,
      paymentsError: paymentsResult.error,
      membersError: membersResult.error
    });
    return <div className="p-4 text-red-500">Error loading splits data</div>;
  }

  return (
    <SplitsDashboard
      expenses={expensesResult.data || []}
      payments={paymentsResult.data || []}
      members={membersResult.data || []}
      roomId={roomId}
      userRole={userData?.role ?? null}
    />
  );
}
