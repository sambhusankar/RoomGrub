'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

/**
 * Client-side auth hook that reads session from Supabase's localStorage cache.
 * Works fully offline - no server calls required.
 *
 * If session is missing or expired, redirects to /login (requires online).
 */
export function useOfflineAuth({ redirectTo = '/login' } = {}) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Get session from localStorage (no server call)
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setLoading(false);
          router.push(redirectTo);
          return;
        }

        if (!session) {
          // No session - need to login (requires online)
          setSession(null);
          setLoading(false);
          router.push(redirectTo);
          return;
        }

        setSession(session);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setSession(null);
        setLoading(false);
        router.push(redirectTo);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          router.push(redirectTo);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, redirectTo]);

  return {
    session,
    loading,
    isAuthenticated: !!session,
    user: session?.user ?? null,
  };
}
