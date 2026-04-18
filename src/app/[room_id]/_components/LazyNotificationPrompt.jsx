'use client';

import dynamic from 'next/dynamic';

// Lazy load notification prompt - most users won't need it (already subscribed or dismissed)
const NotificationPrompt = dynamic(
  () => import('@/components/NotificationPrompt'),
  { ssr: false, loading: () => null }
);

export default function LazyNotificationPrompt() {
  return <NotificationPrompt />;
}
