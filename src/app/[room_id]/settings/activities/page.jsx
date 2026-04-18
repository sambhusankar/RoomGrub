'use server'
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import { createClient } from '@/utils/supabase/server';
import ActivityList from './_components/ActivityList';
import { Box, Typography } from '@mui/joy';

export default async function ActivitiesPage({ params }) {
  const session = await LoginRequired();
  await validRoom({ params });

  const supabase = await createClient();
  const { room_id } = await params;

  // Get current user's role
  const { data: currentUser } = await supabase
    .from('Users')
    .select('role, id')
    .eq('email', session.user.email)
    .single();

  const isAdmin = currentUser?.role === 'Admin';

  // Fetch groceries (Spendings)
  const { data: groceries, error: groceriesError } = await supabase
    .from('Spendings')
    .select('id, user, material, money, created_at')
    .eq('room', room_id)
    .order('created_at', { ascending: false });

  // Fetch payments (Balance - both credits and debits)
  const { data: payments, error: paymentsError } = await supabase
    .from('balance')
    .select('id, user, amount, status, created_at')
    .eq('room', room_id)
    .order('created_at', { ascending: false });

  // Fetch all users in the room to get their names
  const { data: roomUsers } = await supabase
    .from('Users')
    .select('id, email, name')
    .eq('room', room_id);

  // Create a map for quick user lookup
  const userMap = {};
  roomUsers?.forEach(user => {
    userMap[user.id] = user.name || user.email;
    userMap[user.email] = user.name || user.email;
  });

  // Transform groceries
  const groceryActivities = groceries?.map(grocery => ({
    id: grocery.id,
    type: 'grocery',
    user: userMap[grocery.user] || grocery.user,
    amount: grocery.money,
    description: grocery.material,
    createdAt: grocery.created_at,
  })) || [];

  // Transform payments
  const paymentActivities = payments?.map(payment => ({
    id: payment.id,
    type: 'payment',
    user: userMap[payment.user] || payment.user,
    amount: payment.amount,
    description: payment.status === 'credit' ? 'Money Contributed' : 'Money Withdrawn',
    paymentType: payment.status,
    createdAt: payment.created_at,
  })) || [];

  // Combine and sort by date (newest first)
  const allActivities = [...groceryActivities, ...paymentActivities]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Box sx={{
      bgcolor: '#f8f9fa',
      minHeight: '100vh',
      p: 3,
    }}>
      <Typography
        level="h2"
        sx={{
          mb: 4,
          fontWeight: 700,
          color: 'text.primary',
          textAlign: 'center'
        }}
      >
        Activity History
      </Typography>

      <ActivityList
        activities={allActivities}
        isAdmin={isAdmin}
        roomId={room_id}
      />
    </Box>
  );
}
