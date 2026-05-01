'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { validateToken, acceptInvite, rejectInvite } from '@/app/invite/actions';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

// Google icon for the login button
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: 8 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function InvitePage() {
  const { token } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [invite, setInvite] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [invalidReason, setInvalidReason] = useState('');
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      const [{ data: { session: sess } }, validation] = await Promise.all([
        supabase.auth.getSession(),
        validateToken(token),
      ]);

      setSession(sess);

      if (!validation.valid) {
        setTokenValid(false);
        setInvalidReason(validation.reason);
        setLoading(false);
        return;
      }

      setTokenValid(true);
      setInvite(validation.invite);
      setLoading(false);
    };

    init();
  }, [token]);

  const handleLoginWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${SITE_URL}/callback?invite_token=${token}`,
      },
    });
  };

  const handleAccept = async () => {
    setActionLoading(true);
    setError('');
    const result = await acceptInvite(token);
    if (result.success) {
      router.push(`/${result.roomId}`);
    } else {
      setError(result.error || 'Failed to accept invite');
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    setError('');
    const result = await rejectInvite(token);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Failed to decline invite');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Token invalid
  if (!tokenValid) {
    const messages = {
      not_found: "This invite link doesn't exist.",
      expired: 'This invite link has expired (links are valid for 7 days).',
      accepted: 'This invite link has already been used.',
      rejected: 'This invite link is no longer valid.',
    };
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconCircle}>🔗</div>
          <h2 style={styles.title}>Invalid Invite Link</h2>
          <p style={styles.subtitle}>{messages[invalidReason] || 'This invite link is invalid.'}</p>
          <button style={styles.primaryBtn} onClick={() => router.push('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const roomLabel = invite.room?.name ? invite.room.name : `Room #${invite.room?.id}`;
  const inviterName = invite.invitedBy?.name || invite.invitedBy?.email || 'Someone';

  // Scenario 1: not signed in
  if (!session) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconCircle}>🎉</div>
          <h2 style={styles.title}>You're Invited!</h2>
          <p style={styles.subtitle}>
            <strong>{inviterName}</strong> invited you to join <strong>{roomLabel}</strong> on RoomGrub.
          </p>
          <p style={styles.expiry}>Link expires in {invite.daysLeft} day{invite.daysLeft !== 1 ? 's' : ''}</p>
          <button style={styles.googleBtn} onClick={handleLoginWithGoogle}>
            <GoogleIcon />
            Sign in with Google to Join
          </button>
        </div>
      </div>
    );
  }

  // Scenario 2: signed in, no room
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>🎉</div>
        <h2 style={styles.title}>You're Invited!</h2>
        <p style={styles.subtitle}>
          <strong>{inviterName}</strong> invited you to join <strong>{roomLabel}</strong> on RoomGrub.
        </p>
        <p style={styles.expiry}>Link expires in {invite.daysLeft} day{invite.daysLeft !== 1 ? 's' : ''}</p>
        {error && <p style={styles.errorText}>{error}</p>}
        <div style={styles.btnRow}>
          <button
            style={actionLoading ? { ...styles.primaryBtn, opacity: 0.6 } : styles.primaryBtn}
            onClick={handleAccept}
            disabled={actionLoading}
          >
            {actionLoading ? 'Joining...' : 'Accept Invitation'}
          </button>
          <button
            style={actionLoading ? { ...styles.outlineBtn, opacity: 0.6 } : styles.outlineBtn}
            onClick={handleDecline}
            disabled={actionLoading}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backgroundColor: '#f9fafb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    padding: '40px 32px',
    maxWidth: '380px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid #ede9fe',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  iconCircle: {
    fontSize: '40px',
    marginBottom: '4px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1f2937',
    margin: 0,
  },
  subtitle: {
    fontSize: '15px',
    color: '#4b5563',
    margin: 0,
    lineHeight: 1.6,
  },
  expiry: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
  btnRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    marginTop: '8px',
  },
  primaryBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#9333ea',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  outlineBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1.5px solid #ef4444',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '12px',
    backgroundColor: '#fff',
    color: '#1f2937',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '13px',
    margin: 0,
  },
};
