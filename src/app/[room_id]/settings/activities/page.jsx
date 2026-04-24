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

  // Fetch only unsettled groceries (Spendings)
  const { data: groceries } = await supabase
    .from('Spendings')
    .select('id, user, material, money, created_at, settled')
    .eq('room', room_id)
    .or('settled.is.null,settled.eq.false')
    .order('created_at', { ascending: false });

  // Fetch all users in the room to get their names
  const { data: roomUsers } = await supabase
    .from('Users')
    .select('id, email, name')
    .eq('room', room_id);

  // Create a map for quick user lookup
  const userMap = {};
  const emailToName = {};
  roomUsers?.forEach(user => {
    userMap[user.id] = user.name || user.email;
    userMap[user.email] = user.name || user.email;
    emailToName[user.email] = user.name || user.email;
  });

  // Transform groceries — keep raw email for client-side filtering
  const allActivities = groceries?.map(grocery => ({
    id: grocery.id,
    type: 'grocery',
    user: userMap[grocery.user] || grocery.user,
    userEmail: grocery.user,
    amount: grocery.money,
    description: grocery.material,
    createdAt: grocery.created_at,
  })) || [];

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
        userMap={emailToName}
      />
    </Box>
  );
}
