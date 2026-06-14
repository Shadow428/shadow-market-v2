/* ──────────────────────────────────────────────────────────
   App.tsx — Root app with auth, role-based routing, and navbar
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
  const [user, setUser]   = useState<User | null>(() => getSession());
  const [path, setPath]   = useState<Path>(() => {
    const session = getSession();
    return session ? 'marketplace' : 'auth';
  });

  function handleAuth(loggedInUser: User) {
    setUser(loggedInUser);
    setPath('marketplace');
  }

  function handleNavigate(newPath: Path) {
    /* Non-admins cannot access the admin dashboard */
    if (newPath === 'admin' && user?.role !== 'admin') return;
    /* Redirect to auth if trying to access protected areas while logged out */
    if (newPath !== 'auth' && !user) {
      setPath('auth');
      return;
    }
    setPath(newPath);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar is shown on all pages except auth */}
      {path !== 'auth' && (
        <Navbar user={user} onNavigate={handleNavigate} currentPath={path} />
      )}

      {/* Page content */}
      {path === 'auth' && (
        <Auth onAuth={handleAuth} />
      )}

      {path === 'marketplace' && (
        <Marketplace />
      )}

      {path === 'admin' && user?.role === 'admin' && (
        <AdminDashboard />
      )}

      {/* Fallback: non-admin trying to reach admin page */}
      {path === 'admin' && user?.role !== 'admin' && (
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: 'hsl(0 84% 65%)' }}>Access denied.</p>
        </div>
      )}
    </div>
  );
}
