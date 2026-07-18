'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRooms } from '../../actions';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';

const ROOMS_CACHE_KEY = 'roomgrub_user_rooms';

export default function RoomsPage({ initialData }) {
  const router = useRouter();
  const hasInitial = Boolean(initialData && !initialData.error);
  const [rooms, setRooms] = useState(hasInitial ? initialData.rooms : null);
  const [loading, setLoading] = useState(!hasInitial);
  const [firstName, setFirstName] = useState(initialData?.firstName || '');

  useEffect(() => {
    if (hasInitial) {
      localStorage.setItem(ROOMS_CACHE_KEY, JSON.stringify(initialData.rooms));
      return;
    }

    const loadRooms = async () => {
      const cachedRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(ROOMS_CACHE_KEY) : null;
      const cached = cachedRaw ? JSON.parse(cachedRaw) : null;

      if (!navigator.onLine) {
        setRooms(cached || []);
        setLoading(false);
        return;
      }

      try {
        const { rooms: roomList, firstName: name, error: fetchError } = await getUserRooms();
        if (fetchError) {
          setRooms(cached || []);
        } else {
          setFirstName(name);
          localStorage.setItem(ROOMS_CACHE_KEY, JSON.stringify(roomList));
          setRooms(roomList);
        }
      } catch {
        setRooms(cached || []);
      }
      setLoading(false);
    };

    loadRooms();
  }, [hasInitial, initialData]);

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
