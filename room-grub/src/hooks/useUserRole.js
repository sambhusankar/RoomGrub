import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function useUserRole() {
  const [role, setRole] = useState(null);
  const [loadings, setLoading] = useState(true);
  const supabase = createClient()

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('Users') // your table name
        .select('role')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error fetching role:', error.message);
        setRole(null);
      } else {
        setRole(data.role);
      }

      setLoading(false);
    };

    fetchUserRole();
  }, []);

  return { role, loadings };
}
