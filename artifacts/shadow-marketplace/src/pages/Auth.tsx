/* ──────────────────────────────────────────────────────────
   Auth.tsx — Login / Signup page
   ────────────────────────────────────────────────────────── */
import { useState } from 'react';
import { login, signup, saveSession } from '@/lib/auth';
import type { User } from '@/lib/auth';

interface Props {
  onAuth: (user: User) => void;
}

type Mode = 'login' | 'signup';

export default function Auth({ onAuth }: Props) {
  const [mode, setMode]         = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  function reset() {
    setError(''); setUsername(''); setEmail(''); setPassword('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 300)); /* tiny delay for UX */

    if (mode === 'login') {
      const res = login(email, password);
      if (res.success && res.user) {
        saveSession(res.user);
        onAuth(res.user);
      } else {
        setError(res.error ?? 'Login failed.');
      }
    } else {
      const res = signup(username, email, password);
      if (res.success && res.user) {
        saveSession(res.user);
        onAuth(res.user);
      } else {
        setError(res.error ?? 'Signup failed.');
      }
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
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div
            className="text-4xl mb-3"
            style={{ filter: 'drop-shadow(0 0 10px hsl(270 100% 60%))' }}
          >
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
        <div
          className="flex mx-8 mb-6 rounded-lg p-1"
          style={{ background: 'hsl(240 20% 10%)' }}
        >
          {(['login', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); reset(); }}
              className="flex-1 py-2 rounded-md text-sm font-semibold capitalize transition-all"
              style={{
                background: mode === m ? 'linear-gradient(135deg, hsl(270 100% 45%), hsl(270 100% 58%))' : 'transparent',
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
            <Field
              label="Username"
              type="text"
              value={username}
              onChange={setUsername}
              placeholder="Your display name"
              autoFocus
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoFocus={mode === 'login'}
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
          />

          {error && (
            <div
              className="text-sm px-3 py-2 rounded-lg"
              style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.3)', color: 'hsl(0 84% 70%)' }}
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

          {/* Demo hint */}
          <p className="text-xs text-center" style={{ color: 'hsl(270 20% 40%)' }}>
            Admin demo: <span className="font-mono" style={{ color: 'hsl(270 60% 60%)' }}>admin@shadow.gg</span> / <span className="font-mono" style={{ color: 'hsl(270 60% 60%)' }}>admin123</span>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, type, value, onChange, placeholder, autoFocus,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(270 60% 60%)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required
        className="input-field w-full px-4 py-2.5 rounded-lg text-sm"
      />
    </div>
  );
}
