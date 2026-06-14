/* ──────────────────────────────────────────────────────────
   App.tsx — Root app. Marketplace is open without login;
             auth is only required at checkout.
   ────────────────────────────────────────────────────────── */
import { useState } from 'react';
import { getSession } from '@/lib/auth';
import type { User } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Auth from '@/pages/Auth';
import Marketplace from '@/pages/Marketplace';
import AdminDashboard from '@/pages/AdminDashboard';

type Path = 'marketplace' | 'auth' | 'admin';

export default function App() {
  const [user, setUser] = useState<User | null>(() => getSession());
  const [path, setPath] = useState<Path>('marketplace');

  function handleAuth(loggedInUser: User) {
    setUser(loggedInUser);
    setPath('marketplace');
  }

  function handleNavigate(newPath: Path) {
    if (newPath === 'admin' && user?.role !== 'admin') return;
    setPath(newPath);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {path !== 'auth' && (
        <Navbar user={user} onNavigate={handleNavigate} currentPath={path} />
      )}

      {path === 'auth' && <Auth onAuth={handleAuth} />}

      {path === 'marketplace' && (
        <Marketplace
          user={user}
          onAuthSuccess={(u) => setUser(u)}
        />
      )}

      {path === 'admin' && user?.role === 'admin' && <AdminDashboard />}

      {path === 'admin' && user?.role !== 'admin' && (
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: 'hsl(0 84% 65%)' }}>Access denied.</p>
        </div>
      )}
    </div>
  );
}
