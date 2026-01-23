import dynamic from 'next/dynamic';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import { createClient } from '@/utils/supabase/server';

// Lazy load the heavy splits dashboard
const SplitsDashboard = dynamic(() => import('./_components/SplitsDashboard'), {
  loading: () => (
    <div className="p-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-48 bg-gray-200 rounded mb-4"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  )
});

export default async function SplitsPage({ params }) {
  await LoginRequired();
  const userData = await validRoom({ params });

  const supabase = await createClient();
  const roomId = (await params).room_id;

  // Run all queries in parallel for better performance
  const [expensesResult, paymentsResult, membersResult] = await Promise.all([
    supabase
      .from('Spendings')
      .select(`*, Users(name, email, profile)`)
      .eq('room', roomId)
      .order('created_at', { ascending: false }),
    supabase
      .from('balance')
      .select(`*, Users(name, email, profile)`)
      .eq('room', roomId)
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
      userRole={userData?.role}
    />
  );
}
