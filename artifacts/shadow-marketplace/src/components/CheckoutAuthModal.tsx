/* ──────────────────────────────────────────────────────────
   CheckoutAuthModal.tsx — Compact sign-in/up gate shown
   when a guest clicks "Buy Now" at checkout.
   ────────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import { login, signup, saveSession } from '@/lib/auth';
import type { User } from '@/lib/auth';

interface Props {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

type Mode = 'login' | 'signup';

export default function CheckoutAuthModal({ onSuccess, onClose }: Props) {
  const [mode, setMode]         = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  /* Close on Escape */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  function reset() {
    setError(''); setUsername(''); setEmail(''); setPassword(''); setShowPass(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 280));

    const res = mode === 'login'
      ? login(email, password)
      : signup(username, email, password);

    if (res.success && res.user) {
      saveSession(res.user);
      onSuccess(res.user);
    } else {
      setError(res.error ?? 'Something went wrong.');
    }
    setLoading(false);
  }

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-panel rounded-2xl w-full max-w-sm animate-scale-in"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid hsl(270 40% 18%)' }}
        >
          <div>
            <h2 className="font-bold text-base" style={{ color: 'hsl(270 100% 90%)' }}>
              Sign in to continue
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(270 30% 52%)' }}>
              Create a free account or log in to complete your purchase
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-3"
            style={{ color: 'hsl(270 30% 55%)', background: 'hsl(270 20% 12%)' }}
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-5">
          <div
            className="flex rounded-lg p-1"
            style={{ background: 'hsl(240 20% 10%)' }}
          >
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {mode === 'signup' && (
            <Field label="Username" type="text" value={username}
              onChange={setUsername} placeholder="Your display name" autoFocus />
          )}

          <Field label="Email" type="email" value={email}
            onChange={setEmail} placeholder="you@example.com"
            autoFocus={mode === 'login'} />

          {/* Password with toggle */}
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
                  /* Eye-off icon */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  /* Eye icon */
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
            className="btn-primary w-full py-3 rounded-xl text-sm disabled:opacity-60"
          >
            {loading ? '...' : mode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}
          </button>
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
