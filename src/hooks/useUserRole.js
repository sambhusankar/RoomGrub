import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function useUserRole(roomId) {
  const [role, setRole] = useState(null);
  const [loadings, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        return;
      }

      const { data: userRecord } = await supabase
        .from('Users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!userRecord) {
        setLoading(false);
        return;
      }

      const { data: membership, error } = await supabase
        .from('UserRooms')
        .select('role')
        .eq('user_id', userRecord.id)
        .eq('room_id', parseInt(roomId))
        .single();

      if (error) {
        console.error('Error fetching role:', error.message);
      } else {
        setRole(membership?.role || null);
      }

      setLoading(false);
    };

    fetchUserRole();
  }, [roomId]);

  return { role, loadings };
}
