'use server'

import React from 'react';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import { createClient } from '@/utils/supabase/server';
import SplitsDashboard from './_components/SplitsDashboard';

export default async function SplitsPage({ params }) {
  const session = await LoginRequired();
  await validRoom({ params });

  const supabase = await createClient();

  // Fetch current user's role for authorization
  const { data: currentUser } = await supabase
    .from('Users')
    .select('role')
    .eq('email', session.user.email)
    .single();

  // Fetch all expenses (Spendings) for the room
  const { data: expenses, error: expensesError } = await supabase
    .from('Spendings')
    .select(`
      *,
      Users(name, email, profile)
    `)
    .eq('room', params.room_id)
    .order('created_at', { ascending: false });

  // Fetch all payments (balance) for the room
  const { data: payments, error: paymentsError } = await supabase
    .from('balance')
    .select(`
      *,
      Users(name, email, profile)
    `)
    .eq('room', params.room_id)
    .order('created_at', { ascending: false });

  // Fetch all room members
  const { data: members, error: membersError } = await supabase
    .from('Users')
    .select('*')
    .eq('room', params.room_id);

  if (expensesError || paymentsError || membersError) {
    console.error('Error fetching splits data:', { expensesError, paymentsError, membersError });
    return <div>Error loading splits data</div>;
  }

  return (
    <SplitsDashboard
      expenses={expenses || []}
      payments={payments || []}
      members={members || []}
      roomId={params.room_id}
      userRole={currentUser?.role}
    />
  );
}