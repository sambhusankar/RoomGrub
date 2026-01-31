'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';

const ROOM_STORAGE_KEY = 'roomgrub_user_room';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const supabase = createClient();

      // Get session from localStorage (works offline)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        // No session - redirect to login
        router.push('/login');
        return;
      }

      // Try to get room from localStorage first (for offline support)
      const cachedRoom = localStorage.getItem(ROOM_STORAGE_KEY);

      if (navigator.onLine) {
        // Online: fetch fresh room data from DB and cache it
        try {
          const { data, error } = await supabase
            .from('Users')
            .select('room')
            .eq('email', session.user.email)
            .single();

          if (error || !data?.room) {
            // No room found - redirect to create room
            localStorage.removeItem(ROOM_STORAGE_KEY);
            router.push('/create_room');
            return;
          }

          // Cache the room ID for offline use
          localStorage.setItem(ROOM_STORAGE_KEY, data.room);
          router.push(`/${data.room}`);
        } catch (err) {
          // Network error while online - fall back to cached room
          if (cachedRoom) {
            router.push(`/${cachedRoom}`);
          } else {
            router.push('/create_room');
          }
        }
      } else {
        // Offline: use cached room
        if (cachedRoom) {
          router.push(`/${cachedRoom}`);
        } else {
          // No cached room and offline - show create room
          // (user will need to go online to create/join a room)
          router.push('/create_room');
        }
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
