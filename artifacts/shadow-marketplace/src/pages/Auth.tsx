/* ──────────────────────────────────────────────────────────
   Auth.tsx — Standalone login / signup page
   onClose is optional — shows an ✕ when provided so users
   can dismiss and return to the marketplace.
   ────────────────────────────────────────────────────────── */
import { useState } from 'react';
import { login, signup, saveSession } from '@/lib/auth';
import type { User } from '@/lib/auth';

interface Props {
  onAuth: (user: User) => void;
  onClose?: () => void;
}

type Mode = 'login' | 'signup';

export default function Auth({ onAuth, onClose }: Props) {
  const [mode, setMode]         = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  function reset() {
    setError(''); setUsername(''); setEmail(''); setPassword(''); setShowPass(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    if (mode === 'login') {
      const res = login(email, password);
      if (res.success && res.user) { saveSession(res.user); onAuth(res.user); }
      else setError(res.error ?? 'Login failed.');
    } else {
      const res = signup(username, email, password);
      if (res.success && res.user) { saveSession(res.user); onAuth(res.user); }
      else setError(res.error ?? 'Signup failed.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background orb */}
      <div
        className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, hsl(270 100% 30% / 0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: 'linear-gradient(145deg, hsl(240 20% 8%), hsl(240 15% 6%))',
          border: '1px solid hsl(270 50% 20%)',
          boxShadow: '0 30px 60px hsl(240 20% 2% / 0.8), 0 0 0 1px hsl(270 100% 60% / 0.06)',
        }}
      >
        {/* ✕ close button — only shown when onClose is provided */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10"
            style={{ color: 'hsl(270 30% 55%)', background: 'hsl(270 20% 12%)' }}
          >
            ✕
          </button>
        )}

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="text-4xl mb-3" style={{ filter: 'drop-shadow(0 0 10px hsl(270 100% 60%))' }}>
            ⛏️
          </div>
          <h1 className="font-black text-2xl glow-text" style={{ color: 'hsl(270 100% 85%)' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(270 30% 55%)' }}>
            {mode === 'login'
              ? 'Sign in to access Shadow Marketplace'
              : 'Join to start buying premium accounts'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex mx-8 mb-6 rounded-lg p-1" style={{ background: 'hsl(240 20% 10%)' }}>
          {(['login', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); reset(); }}
              className="flex-1 py-2 rounded-md text-sm font-semibold capitalize transition-all"
              style={{
                background: mode === m
                  ? 'linear-gradient(135deg, hsl(270 100% 45%), hsl(270 100% 58%))'
                  : 'transparent',
                color: mode === m ? 'white' : 'hsl(270 30% 55%)',
                boxShadow: mode === m ? '0 0 12px hsl(270 100% 55% / 0.3)' : 'none',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 flex flex-col gap-4">
          {mode === 'signup' && (
            <Field label="Username" type="text" value={username}
              onChange={setUsername} placeholder="Your display name" autoFocus />
          )}

          <Field label="Email" type="email" value={email}
            onChange={setEmail} placeholder="you@example.com"
            autoFocus={mode === 'login'} />

          {/* Password with show/hide toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'hsl(270 60% 60%)' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                required
                className="input-field w-full px-4 py-2.5 rounded-lg text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: showPass ? 'hsl(270 100% 70%)' : 'hsl(270 30% 45%)' }}
                tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="text-sm px-3 py-2 rounded-lg"
              style={{
                background: 'hsl(0 84% 60% / 0.1)',
                border: '1px solid hsl(0 84% 60% / 0.3)',
                color: 'hsl(0 84% 70%)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl text-sm mt-1 disabled:opacity-60"
          >
            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {mode === 'login' && (
            <div
              className="rounded-xl px-4 py-3 mt-1"
              style={{
                background: 'hsl(270 40% 10%)',
                border: '1px solid hsl(270 40% 20%)',
              }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: 'hsl(270 60% 60%)' }}>
                🛠️ Admin Quick Login
              </p>
              <p className="text-xs mb-2" style={{ color: 'hsl(270 30% 50%)' }}>
                Email: <span style={{ color: 'hsl(270 80% 75%)' }}>admin@shadow.gg</span>
                &nbsp;&nbsp;Password: <span style={{ color: 'hsl(270 80% 75%)' }}>admin123</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@shadow.gg');
                  setPassword('admin123');
                }}
                className="text-xs px-3 py-1 rounded-lg transition-colors"
                style={{
                  background: 'hsl(270 100% 55% / 0.15)',
                  border: '1px solid hsl(270 100% 55% / 0.35)',
                  color: 'hsl(270 100% 75%)',
                }}
              >
                Fill admin credentials
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({
  label, type, value, onChange, placeholder, autoFocus,
}: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'hsl(270 60% 60%)' }}>
        {label}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoFocus={autoFocus} required
        className="input-field w-full px-4 py-2.5 rounded-lg text-sm" />
    </div>
  );
}
