'use client'
import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

// Inline SVG icons to avoid MUI icons dependency
const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function NavBar({ user, signOut }) {
  const { room_id } = useParams();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSignOut() {
    setMenuOpen(false);
    signOut();
  }

  return (
    <header className="w-full h-max flex justify-between items-center px-4 border-b border-gray-200">
      <h1
        className="text-xl font-bold text-black cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => router.push(`/${room_id}`)}
      >
        RoomGrub
      </h1>

      {user && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-black"
          >
            {user?.user_metadata?.picture ? (
              <Image
                src={user.user_metadata.picture}
                alt="Profile"
                width={36}
                height={36}
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-sm font-medium rounded-full">
                {user?.user_metadata?.name?.[0] || '?'}
              </div>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
              <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200 truncate">
                {user?.user_metadata?.name}
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 flex items-center gap-2"
              >
                <LogoutIcon /> Logout
              </button>
              <button
                onClick={() => {
                  router.push(`/${room_id}/settings`);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 flex items-center gap-2"
              >
                <SettingsIcon /> Settings
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}