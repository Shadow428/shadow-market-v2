/* ──────────────────────────────────────────────────────────
   App.tsx — Root app with admin panel keyboard shortcut
   ────────────────────────────────────────────────────────── */
import { useEffect, useState } from 'react';
import { Router as WouterRouter, Switch, Route } from 'wouter';
import Marketplace from '@/pages/Marketplace';
import AdminPanel from '@/components/AdminPanel';

function App() {
  const [adminOpen, setAdminOpen] = useState(false);

  /* Ctrl + Shift + A → open admin panel */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setAdminOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Switch>
        <Route path="/" component={Marketplace} />
        <Route>
          {/* Fallback to marketplace for unknown routes */}
          <Marketplace />
        </Route>
      </Switch>

      {/* Hidden admin panel — toggled by Ctrl+Shift+A */}
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
    </WouterRouter>
  );
}

export default App;
