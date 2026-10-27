'use client';

import { useEffect } from 'react';
import { LAST_ROOM_COOKIE, SESSION_MAX_AGE } from '@/auth/constants';

// Stores the open room in a cookie so `/` (app launch, sign-in) can reopen it. Server
// Components can't set cookies, and this only mounts after the room layout checked membership.
export default function RememberRoom({ roomId }) {
  useEffect(() => {
    document.cookie = `${LAST_ROOM_COOKIE}=${roomId}; path=/; max-age=${SESSION_MAX_AGE}; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}`;
  }, [roomId]);

  return null;
}
