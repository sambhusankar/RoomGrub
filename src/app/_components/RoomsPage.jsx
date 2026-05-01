'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';

const ROOMS_CACHE_KEY = 'roomgrub_user_rooms';

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const loadRooms = async () => {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        router.push('/login');
        return;
      }

      setFirstName(session.user.user_metadata?.full_name?.split(' ')[0] || 'there');

      const cachedRaw = localStorage.getItem(ROOMS_CACHE_KEY);
      const cached = cachedRaw ? JSON.parse(cachedRaw) : null;

      if (!navigator.onLine) {
        setRooms(cached || []);
        setLoading(false);
        return;
      }

      try {
        const { data: userRecord } = await supabase
          .from('Users')
          .select('id')
          .eq('email', session.user.email)
          .single();

        const { data: memberships } = await supabase
          .from('UserRooms')
          .select('room_id, role, Rooms(id, admin, members)')
          .eq('user_id', userRecord.id);

        const roomList = (memberships || []).map(m => ({
          id: m.room_id,
          role: m.role,
          ...m.Rooms,
        }));

        localStorage.setItem(ROOMS_CACHE_KEY, JSON.stringify(roomList));
        setRooms(roomList);
      } catch {
        setRooms(cached || []);
      }
      setLoading(false);
    };

    loadRooms();
  }, [router]);

  if (loading || rooms === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 2, px: 2, pb: 12 }}>
      <Box sx={{ pt: 1, pb: 1, px: 1 }}>
        <Typography level="h3" fontWeight="lg">Hi {firstName} 👋</Typography>
        <Typography level="body-sm" color="neutral">Welcome Back</Typography>
      </Box>
      <Typography level="h3" sx={{ mb: 3, mt: 2 }}>My Rooms</Typography>

      {rooms.length === 0 ? (
        <Card variant="outlined" sx={{ textAlign: 'center', p: 4 }}>
          <CardContent>
            <Typography level="body-md" color="neutral">
              You are not in any room yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        rooms.map(room => (
          <Card
            key={room.id}
            variant="outlined"
            sx={{
              mb: 2,
              cursor: 'pointer',
              borderColor: 'primary.200',
              boxShadow: 'sm',
              transition: 'box-shadow 0.15s, border-color 0.15s',
              '&:hover': { boxShadow: 'md', borderColor: 'primary.400' },
              '&:active': { boxShadow: 'xs' },
            }}
            onClick={() => router.push(`/${room.id}`)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography level="title-lg" fontWeight="lg">Room #{room.id}</Typography>
                  <Typography level="body-sm" color="neutral" sx={{ mt: 0.5 }}>
                    {room.members} member{room.members !== 1 ? 's' : ''} · {room.role}
                  </Typography>
                </Box>
                <Box sx={{
                  bgcolor: 'primary.softBg',
                  color: 'primary.plainColor',
                  borderRadius: '999px',
                  px: 2,
                  py: 0.5,
                  fontSize: 'sm',
                  fontWeight: 'md',
                }}>
                  Open →
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>

      <Box sx={{
        position: 'fixed',
        bottom: 24,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 100,
      }}>
        <Button
          onClick={() => router.push('/create_room')}
          variant={rooms.length === 0 ? 'solid' : 'outlined'}
          color={rooms.length === 0 ? 'primary' : 'neutral'}
          size={rooms.length === 0 ? 'lg' : 'md'}
          sx={{ borderRadius: '999px', px: 4, ...(rooms.length === 0 && { boxShadow: 'lg' }) }}
        >
          + New Room
        </Button>
      </Box>
    </>
  );
}
