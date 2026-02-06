import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const ROLE_CACHE_KEY = 'user_role';

export default function useUserRole() {
  const [role, setRole] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ROLE_CACHE_KEY);
    }
    return null;
  });
  const [loadings, setLoading] = useState(true);
  const supabase = createClient()

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('Users')
        .select('role')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error fetching role:', error.message);
      } else {
        setRole(data.role);
        localStorage.setItem(ROLE_CACHE_KEY, data.role);
      }

      setLoading(false);
    };

    fetchUserRole();
  }, []);

  return { role, loadings };
}
