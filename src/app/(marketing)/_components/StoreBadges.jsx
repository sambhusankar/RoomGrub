'use client';

import { motion } from 'framer-motion';

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M3.6 2.3c-.4.3-.6.7-.6 1.2v17c0 .5.2.9.6 1.2l9.6-9.7-9.6-9.7zM15 12l2.6-2.6 3.2 1.8c.9.5.9 1.9 0 2.4l-3.2 1.8L15 12zM4.6 21.7 14.2 12 4.6 2.3c-.4.2-.6.5-.6.9v17.6c0 .4.2.7.6.9zM14.9 12.7l1.8 1.8-9.9 5.6 8.1-7.4z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.437 2.06-1.311 2.94-.94.95-2.03 1.48-3.21 1.39-.12-1.13.44-2.14 1.29-2.99.9-.9 2.03-1.44 3.23-1.34zM20.5 17.6c-.55 1.26-.82 1.83-1.53 2.94-.99 1.56-2.4 3.5-4.14 3.51-1.55.02-1.95-1-4.05-1s-2.55.98-4.11 1.02c-1.75.05-3.08-1.68-4.07-3.24C.68 17.86-.4 13.55 1.2 10.7c.94-1.7 2.6-2.77 4.43-2.8 1.5-.03 2.9 1.02 3.8 1.02.9 0 2.63-1.26 4.42-1.07.75.03 2.87.3 4.24 2.28-.11.07-2.52 1.48-2.5 4.42.03 3.5 3.1 4.67 3.14 4.68-.03.09-.5 1.6-1.72 3.38z" />
    </svg>
  );
}

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=broccly.roomgrub.twa&pcampaignid=web_share';

const badges = [
  { Icon: PlayIcon, top: 'GET IT ON', bottom: 'Google Play', href: PLAY_STORE_URL },
  { Icon: AppleIcon, top: 'Available as a', bottom: 'PWA on iOS', href: '#how-it-works' },
];

export default function StoreBadges() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
      {badges.map(({ Icon, top, bottom, href }) => (
        <motion.a
          key={bottom}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 rounded-lg bg-neutral-900 px-4 py-2 text-white"
        >
          <Icon />
          <span className="flex flex-col leading-none">
            <span className="text-[10px]">{top}</span>
            <span className="text-sm font-semibold">{bottom}</span>
          </span>
        </motion.a>
      ))}
    </div>
  );
}
