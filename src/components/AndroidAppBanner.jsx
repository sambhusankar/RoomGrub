'use client';

import { useEffect, useState } from 'react';
import { PLAY_STORE_PACKAGE, PLAY_STORE_BANNER_URL } from '@/constants/playStore';

const DISMISS_KEY = 'android-app-banner-dismissed-at';
const IN_APP_KEY = 'rg-in-twa';
const DISMISS_DAYS = 14;

function safeGet(storage, key) {
  try {
    return window[storage].getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    window[storage].setItem(key, value);
  } catch {
    // Storage blocked (private mode etc.) — nothing to remember.
  }
}

// True when the page is running inside the Play Store app (TWA) or an installed PWA.
function isInsideApp() {
  // The TWA only sets this referrer on the first page, so remember it for the session.
  if (document.referrer.startsWith(`android-app://${PLAY_STORE_PACKAGE}`)) {
    safeSet('sessionStorage', IN_APP_KEY, '1');
  }
  if (safeGet('sessionStorage', IN_APP_KEY) === '1') return true;
  return window.matchMedia?.('(display-mode: standalone)').matches ?? false;
}

function recentlyDismissed() {
  const at = Number(safeGet('localStorage', DISMISS_KEY));
  return at > 0 && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

async function isAppInstalled() {
  try {
    const apps = (await navigator.getInstalledRelatedApps?.()) ?? [];
    return apps.some((app) => app.platform === 'play' && app.id === PLAY_STORE_PACKAGE);
  } catch {
    return false;
  }
}

export default function AndroidAppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!/Android/i.test(navigator.userAgent)) return;
    if (isInsideApp() || recentlyDismissed()) return;

    let cancelled = false;
    isAppInstalled().then((installed) => {
      if (!cancelled && !installed) setVisible(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    safeSet('localStorage', DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Get the RoomGrub app"
      className="flex items-center gap-3 border-b border-purple-200 bg-white/95 px-3 py-2 shadow-sm"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss app banner"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-lg leading-none text-neutral-500 hover:bg-neutral-100"
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/logo-96.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-semibold text-neutral-900">RoomGrub</p>
        <p className="truncate text-xs text-neutral-600">Split bills with roommates</p>
        <p className="truncate text-[11px] text-neutral-500">Get on Google Play Store</p>
      </div>
      <a
        href={PLAY_STORE_BANNER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold text-white"
        style={{ backgroundColor: '#9333ea' }}
      >
        Get
      </a>
    </div>
  );
}
