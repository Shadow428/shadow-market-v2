/* ──────────────────────────────────────────────────────────
   App.tsx — Root: open marketplace, cart, auth, orders
   ────────────────────────────────────────────────────────── */
import { useState, useCallback } from 'react';
import { getSession } from '@/lib/auth';
import { getCart } from '@/lib/cart';
import type { User } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import Auth from '@/pages/Auth';
import Marketplace from '@/pages/Marketplace';
import AdminDashboard from '@/pages/AdminDashboard';
import CartDrawer from '@/components/CartDrawer';
import MyOrdersModal from '@/components/MyOrdersModal';
import type { CartItem } from '@/lib/cart';

type Path = 'marketplace' | 'auth' | 'admin';

export default function App() {
  const [user, setUser]           = useState<User | null>(() => getSession());
  const [path, setPath]           = useState<Path>('marketplace');
  const [cartOpen, setCartOpen]   = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [cart, setCart]           = useState<CartItem[]>(() => getCart());

  /* Re-read cart from localStorage and sync state */
  const refreshCart = useCallback(() => setCart(getCart()), []);

  function handleAuth(loggedInUser: User) {
    setUser(loggedInUser);
    setPath('marketplace');
  }

  function handleNavigate(newPath: Path) {
    if (newPath === 'admin' && user?.role !== 'admin') return;
    setPath(newPath);
    setCartOpen(false);
    setOrdersOpen(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar always visible except on full-page auth */}
      {path !== 'auth' && (
        <Navbar
          user={user}
          cartCount={cart.length}
          onNavigate={handleNavigate}
          onOpenCart={() => setCartOpen(true)}
          onOpenOrders={() => setOrdersOpen(true)}
          onLogout={() => { setUser(null); setPath('marketplace'); }}
          currentPath={path}
        />
      )}

      {/* ── Pages ────────────────────────────────── */}
      {path === 'auth' && (
        <Auth
          onAuth={handleAuth}
          onClose={() => setPath('marketplace')}
        />
      )}

      {path === 'marketplace' && (
        <Marketplace
          user={user}
          cart={cart}
          onCartChange={refreshCart}
          onAuthSuccess={(u) => setUser(u)}
        />
      )}

      {path === 'admin' && user?.role === 'admin' && <AdminDashboard />}

      {path === 'admin' && user?.role !== 'admin' && (
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: 'hsl(0 84% 65%)' }}>Access denied.</p>
        </div>
      )}

      {/* ── Cart drawer ──────────────────────────── */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onCartChange={refreshCart}
          onCheckout={(product) => {
            setCartOpen(false);
            /* Tell Marketplace to open payment for this product */
            window.dispatchEvent(new CustomEvent('sm:buy', { detail: product }));
          }}
          onClose={() => setCartOpen(false)}
        />
      )}

      {/* ── My Orders modal ──────────────────────── */}
      {ordersOpen && user && (
        <MyOrdersModal user={user} onClose={() => setOrdersOpen(false)} />
      )}
    </div>
  );
}
