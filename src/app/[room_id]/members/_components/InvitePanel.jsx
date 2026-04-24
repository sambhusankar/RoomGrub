'use client';

import { useState } from 'react';
import { createInvite, revokeInvite } from '@/app/invite/actions';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export default function InvitePanel({ roomId, initialInvites }) {
  const [invites, setInvites] = useState(initialInvites || []);
  const [currentToken, setCurrentToken] = useState(
    initialInvites?.length > 0 ? initialInvites[0].token : null
  );
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  const inviteLink = currentToken ? `${SITE_URL}/invite/${currentToken}` : null;

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    const result = await createInvite(roomId);
    if (result.success) {
      const newToken = result.token;
      setCurrentToken(newToken);
      // Replace old invites since we enforce one at a time
      setInvites([{ token: newToken, created_at: new Date().toISOString() }]);
    } else {
      setError(result.error || 'Failed to generate link');
    }
    setGenerating(false);
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!inviteLink) return;
    if (navigator.share) {
      await navigator.share({
        title: 'Join my RoomGrub room',
        text: 'Hey! Join my RoomGrub room to track our shared expenses. Accept here:',
        url: inviteLink,
      });
    } else {
      setShowShareMenu(prev => !prev);
    }
  };

  const handleWhatsApp = () => {
    if (!inviteLink) return;
    const msg = `Hey! Join my RoomGrub room to track our shared expenses. Accept here: ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleRevoke = async (inviteToken) => {
    const invite = invites.find(i => i.token === inviteToken);
    if (!invite) return;
    await revokeInvite(invite.id, roomId);
    setInvites([]);
    setCurrentToken(null);
  };

  const daysLeft = (createdAt) => {
    const expiry = new Date(createdAt);
    expiry.setDate(expiry.getDate() + 7);
    return Math.max(0, Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)));
  };

  return (
    <div style={styles.card}>
        <h2 style={styles.title}>Invite via Link</h2>
        <p style={styles.subtitle}>
          Generate a link and share it with your friend via WhatsApp or SMS.
          Anyone with the link can join your room.
        </p>

        {error && <p style={styles.errorText}>{error}</p>}

        {inviteLink ? (
          <>
            <div style={styles.linkRow}>
              <input
                readOnly
                value={inviteLink}
                style={styles.linkInput}
                onClick={e => e.target.select()}
              />
              <button style={styles.copyBtn} onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <button style={styles.shareBtn} onClick={handleShare}>
                Share
              </button>
              {showShareMenu && (
                <div style={styles.shareMenu}>
                  <button style={styles.shareMenuItem} onClick={handleWhatsApp}>
                    <WhatsAppIcon />
                    WhatsApp
                  </button>
                  <button style={styles.shareMenuItem} onClick={handleCopy}>
                    📋 {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              )}
            </div>

            <button
              style={generating ? { ...styles.generateBtn, opacity: 0.6 } : styles.generateBtn}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate New Link'}
            </button>
          </>
        ) : (
          <button
            style={generating ? { ...styles.primaryBtn, opacity: 0.6 } : styles.primaryBtn}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Invite Link'}
          </button>
        )}

        {invites.length > 0 && (
          <div style={styles.activeSection}>
            <p style={styles.activeSectionTitle}>Active Link</p>
            {invites.map((inv) => (
              <div key={inv.token} style={styles.inviteRow}>
                <span style={styles.inviteInfo}>
                  Expires in {daysLeft(inv.created_at)} day{daysLeft(inv.created_at) !== 1 ? 's' : ''}
                </span>
                <button
                  style={styles.revokeBtn}
                  onClick={() => handleRevoke(inv.token)}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366" style={{ marginRight: 6 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    padding: '36px 28px',
    maxWidth: '420px',
    width: '100%',
    border: '1px solid #ede9fe',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1f2937',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.6,
  },
  errorText: {
    color: '#ef4444',
    fontSize: '13px',
    margin: 0,
  },
  linkRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  linkInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#374151',
    backgroundColor: '#f9fafb',
    outline: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  copyBtn: {
    padding: '10px 16px',
    backgroundColor: '#9333ea',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  shareBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  shareMenu: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    zIndex: 10,
  },
  shareMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    color: '#1f2937',
    cursor: 'pointer',
    textAlign: 'left',
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
  generateBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    color: '#9333ea',
    border: '1.5px solid #9333ea',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  activeSection: {
    borderTop: '1px solid #f3f4f6',
    paddingTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  activeSectionTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  },
  inviteRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#faf5ff',
    borderRadius: '8px',
    border: '1px solid #ede9fe',
  },
  inviteInfo: {
    fontSize: '13px',
    color: '#6b7280',
  },
  revokeBtn: {
    padding: '4px 10px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
