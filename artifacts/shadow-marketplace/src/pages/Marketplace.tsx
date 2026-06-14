/* ──────────────────────────────────────────────────────────
   Marketplace.tsx — Open to all; cart + checkout auth gate
   ────────────────────────────────────────────────────────── */
import { useState, useCallback, useEffect } from 'react';
import { getProducts } from '@/lib/storage';
import { addToCart } from '@/lib/cart';
import type { CartItem } from '@/lib/cart';
import type { Product } from '@/lib/storage';
import type { User } from '@/lib/auth';
import ProductCard from '@/components/ProductCard';
import PaymentModal from '@/components/PaymentModal';
import CheckoutAuthModal from '@/components/CheckoutAuthModal';
import Toast from '@/components/Toast';

interface ToastMsg { id: number; message: string; type?: 'success' | 'info'; }

interface Props {
  user: User | null;
  cart: CartItem[];
  onCartChange: () => void;
  onAuthSuccess: (user: User) => void;
}

type ModalState = 'none' | 'auth' | 'payment';

export default function Marketplace({ user, cart, onCartChange, onAuthSuccess }: Props) {
  const [products]          = useState<Product[]>(() => getProducts());
  const [pending, setPending] = useState<Product | null>(null);
  const [modal, setModal]   = useState<ModalState>('none');
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const showToast = useCallback((message: string, type: ToastMsg['type'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  /* Listen for buy events dispatched by the CartDrawer */
  useEffect(() => {
    function handler(e: Event) {
      const product = (e as CustomEvent<Product>).detail;
      triggerBuy(product);
    }
    window.addEventListener('sm:buy', handler);
    return () => window.removeEventListener('sm:buy', handler);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  function triggerBuy(product: Product) {
    setPending(product);
    setModal(user ? 'payment' : 'auth');
  }

  function handleAddToCart(product: Product) {
    const { added, alreadyIn } = addToCart(product);
    onCartChange();
    if (added)      showToast(`${product.name} added to cart.`, 'success');
    if (alreadyIn)  showToast(`${product.name} is already in your cart.`, 'info');
  }

  function handleAuthSuccess(loggedInUser: User) {
    onAuthSuccess(loggedInUser);
    setModal('payment');
  }

  function handleClose() {
    setModal('none');
    setPending(null);
  }

  function handlePaymentSuccess() {
    showToast('Order placed! Pending payment verification.');
    handleClose();
  }

  const cartIds = new Set(cart.map(i => i.product.id));

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Hero ──────────────────────────────────── */}
      <header className="relative overflow-hidden pt-16 pb-12 px-4 text-center">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, hsl(270 100% 50%) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl animate-flicker" style={{ filter: 'drop-shadow(0 0 8px hsl(270 100% 60%))' }}>⛏️</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight glow-text" style={{ color: 'hsl(270 100% 85%)' }}>
              Shadow<span style={{ color: 'hsl(270 100% 65%)' }}>Market</span>
            </h1>
          </div>
          <p className="text-base md:text-lg max-w-xl" style={{ color: 'hsl(270 30% 60%)' }}>
            Premium Minecraft accounts. Instant access. Untraceable origin.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {[
              { icon: '👥', label: '1,200+ accounts sold' },
              { icon: '⚡', label: 'Instant delivery' },
              { icon: '🔒', label: 'Secure UPI payments' },
            ].map(s => (
              <span key={s.label} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'hsl(270 100% 60% / 0.08)', border: '1px solid hsl(270 60% 25%)', color: 'hsl(270 70% 70%)' }}>
                {s.icon} {s.label}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-10 h-px w-full max-w-2xl mx-auto"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(270 100% 60% / 0.3), transparent)' }} />
      </header>

      {/* ── Product grid ─────────────────────────── */}
      <main className="flex-1 px-4 pb-16 max-w-6xl mx-auto w-full">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: 'hsl(270 60% 55%)' }}>
          Available Accounts — {products.length} listings
        </h2>

        {products.length === 0 ? (
          <div className="rounded-2xl flex flex-col items-center gap-3 py-20 text-center"
            style={{ background: 'hsl(240 15% 7%)', border: '1px solid hsl(270 30% 15%)' }}>
            <span className="text-5xl">📭</span>
            <p style={{ color: 'hsl(270 30% 55%)' }}>No products listed yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onBuy={triggerBuy}
                onAddToCart={handleAddToCart}
                inCart={cartIds.has(p.id)}
              />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-xs" style={{ color: 'hsl(270 20% 35%)' }}>
          All transactions are final. Accounts delivered within 24 hours of payment verification.
        </p>
      </main>

      {/* ── Checkout auth gate ────────────────────── */}
      {modal === 'auth' && (
        <CheckoutAuthModal onSuccess={handleAuthSuccess} onClose={handleClose} />
      )}

      {/* ── Payment modal ─────────────────────────── */}
      {modal === 'payment' && pending && (
        <PaymentModal product={pending} onClose={handleClose} onSuccess={handlePaymentSuccess} />
      )}

      {/* ── Toasts ────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map(t => <Toast key={t.id} message={t.message} />)}
      </div>
    </div>
  );
}
