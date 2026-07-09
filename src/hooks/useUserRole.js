import { useEffect, useState } from 'react';
import { apiCall } from '@/utils/api';

export default function useUserRole(roomId) {
  const [role, setRole] = useState(null);
  const [loadings, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const members = await apiCall(`/api/rooms/${roomId}/members`);
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('rg_user='));
        if (!userCookie) { setLoading(false); return; }
        const userInfo = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        const me = (members || []).find(m => m.email === userInfo.email);
        setRole(me?.role || null);
      } catch {
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [roomId]);

  return { role, loadings };
}
