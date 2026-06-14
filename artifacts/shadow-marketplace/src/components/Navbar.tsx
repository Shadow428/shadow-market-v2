/* ──────────────────────────────────────────────────────────
   Navbar.tsx — Top navbar with logo + profile avatar
   ────────────────────────────────────────────────────────── */
import { useState, useRef, useEffect } from 'react';
import type { User } from '@/lib/auth';
import { logout } from '@/lib/auth';

interface Props {
  user: User | null;
  onNavigate: (path: 'marketplace' | 'auth' | 'admin') => void;
  currentPath: string;
}

export default function Navbar({ user, onNavigate, currentPath }: Props) {
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    logout();
    setDropOpen(false);
    onNavigate('auth');
  }

  const initials = user
    ? user.username.slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav
      className="sticky top-0 z-40 w-full flex items-center justify-between px-4 md:px-8 h-14"
      style={{
        background: 'hsl(240 15% 5% / 0.95)',
        borderBottom: '1px solid hsl(270 40% 16%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <button
        onClick={() => onNavigate('marketplace')}
        className="flex items-center gap-2 group"
      >
        <span
          className="text-xl"
          style={{ filter: 'drop-shadow(0 0 6px hsl(270 100% 60%))' }}
        >
          ⛏️
        </span>
        <span
          className="font-black text-lg tracking-tight"
          style={{ color: 'hsl(270 100% 85%)' }}
        >
          Shadow<span style={{ color: 'hsl(270 100% 65%)' }}>Market</span>
        </span>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user ? (
          /* ── Logged in: avatar dropdown ─────────── */
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen(p => !p)}
              className="flex items-center gap-2 rounded-full transition-all"
              style={{ outline: dropOpen ? '2px solid hsl(270 100% 60%)' : 'none', outlineOffset: '2px' }}
              aria-label="Profile menu"
            >
              {/* Avatar circle */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 select-none"
                style={{
                  background: user.avatarColor,
                  boxShadow: `0 0 8px ${user.avatarColor}88`,
                  color: 'white',
                }}
              >
                {initials}
              </div>
              {/* Name — hidden on mobile */}
              <span
                className="hidden sm:block text-sm font-medium max-w-[100px] truncate"
                style={{ color: 'hsl(270 80% 80%)' }}
              >
                {user.username}
              </span>
              {/* Chevron */}
              <span
                className="text-xs transition-transform"
                style={{
                  color: 'hsl(270 40% 55%)',
                  transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▾
              </span>
            </button>

            {/* Dropdown */}
            {dropOpen && (
              <div
                className="absolute right-0 top-10 rounded-xl overflow-hidden animate-scale-in min-w-[180px]"
                style={{
                  background: 'hsl(240 20% 8%)',
                  border: '1px solid hsl(270 40% 20%)',
                  boxShadow: '0 16px 40px hsl(240 20% 2% / 0.8), 0 0 0 1px hsl(270 100% 60% / 0.08)',
                }}
              >
                {/* User info header */}
                <div
                  className="px-4 py-3"
                  style={{ borderBottom: '1px solid hsl(270 30% 15%)' }}
                >
                  <div className="text-sm font-semibold" style={{ color: 'hsl(270 80% 85%)' }}>
                    {user.username}
                  </div>
                  <div className="text-xs mt-0.5 truncate" style={{ color: 'hsl(270 30% 50%)' }}>
                    {user.email}
                  </div>
                  <span
                    className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                    style={{
                      background: user.role === 'admin' ? 'hsl(270 100% 60% / 0.15)' : 'hsl(270 30% 15%)',
                      border: `1px solid ${user.role === 'admin' ? 'hsl(270 100% 60% / 0.4)' : 'hsl(270 30% 25%)'}`,
                      color: user.role === 'admin' ? 'hsl(270 100% 75%)' : 'hsl(270 40% 60%)',
                    }}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {user.role === 'admin' && (
                    <DropItem
                      icon="🛠️"
                      label="Admin Dashboard"
                      active={currentPath === 'admin'}
                      onClick={() => { setDropOpen(false); onNavigate('admin'); }}
                    />
                  )}
                  <DropItem
                    icon="🏪"
                    label="Marketplace"
                    active={currentPath === 'marketplace'}
                    onClick={() => { setDropOpen(false); onNavigate('marketplace'); }}
                  />
                  <div style={{ borderTop: '1px solid hsl(270 30% 12%)', margin: '4px 0' }} />
                  <DropItem
                    icon="🚪"
                    label="Logout"
                    danger
                    onClick={handleLogout}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Not logged in ───────────────────────── */
          <button
            onClick={() => onNavigate('auth')}
            className="btn-primary px-4 py-1.5 rounded-lg text-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

function DropItem({
  icon, label, onClick, active, danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors"
      style={{
        color: danger
          ? 'hsl(0 80% 65%)'
          : active
          ? 'hsl(270 100% 80%)'
          : 'hsl(270 50% 70%)',
        background: active ? 'hsl(270 100% 60% / 0.08)' : 'transparent',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = danger
          ? 'hsl(0 80% 50% / 0.08)'
          : 'hsl(270 100% 60% / 0.08)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = active
          ? 'hsl(270 100% 60% / 0.08)'
          : 'transparent';
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
