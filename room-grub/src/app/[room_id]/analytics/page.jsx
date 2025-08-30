'use server'

import React from 'react';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import { createClient } from '@/utils/supabase/server';
import AnalyticsDashboard from './_components/AnalyticsDashboard';

export default async function AnalyticsPage({ params }) {
  const session = await LoginRequired();
  await validRoom({ params });
  
  const supabase = await createClient();
  
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
    console.error('Error fetching analytics data:', { expensesError, paymentsError, membersError });
    return <div>Error loading analytics data</div>;
  }

  return (
    <AnalyticsDashboard 
      expenses={expenses || []}
      payments={payments || []}
      members={members || []}
      roomId={params.room_id}
    />
  );
}