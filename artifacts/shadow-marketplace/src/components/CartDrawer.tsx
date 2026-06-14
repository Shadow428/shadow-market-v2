/* ──────────────────────────────────────────────────────────
   CartDrawer.tsx — Slide-in cart panel
   ────────────────────────────────────────────────────────── */
import { useEffect } from 'react';
import type { CartItem } from '@/lib/cart';
import { removeFromCart, cartTotal } from '@/lib/cart';
import type { Product } from '@/lib/storage';

interface Props {
  cart: CartItem[];
  onCartChange: () => void;
  onCheckout: (product: Product) => void;
  onClose: () => void;
}

export default function CartDrawer({ cart, onCartChange, onCheckout, onClose }: Props) {
  /* Close on Escape */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  function handleRemove(id: string) {
    removeFromCart(id);
    onCartChange();
  }

  const total = cartTotal(cart);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 modal-backdrop animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className="fixed top-0 right-0 h-full z-50 flex flex-col w-full max-w-sm animate-slide-in-right"
        style={{
          background: 'linear-gradient(180deg, hsl(240 20% 7%), hsl(240 15% 5%))',
          borderLeft: '1px solid hsl(270 40% 18%)',
          boxShadow: '-20px 0 60px hsl(240 20% 2% / 0.8)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid hsl(270 40% 15%)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <h2 className="font-bold text-base" style={{ color: 'hsl(270 100% 88%)' }}>
              Your Cart
            </h2>
            {cart.length > 0 && (
              <span
                className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'hsl(270 100% 55%)', color: 'white' }}
              >
                {cart.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: 'hsl(270 30% 55%)', background: 'hsl(270 20% 12%)' }}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <span className="text-5xl opacity-40">🛒</span>
              <p className="text-sm" style={{ color: 'hsl(270 30% 50%)' }}>
                Your cart is empty.
                <br />
                Add accounts from the marketplace.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.map(({ product }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{
                    background: 'hsl(240 18% 9%)',
                    border: '1px solid hsl(270 30% 15%)',
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{
                      background: 'hsl(270 100% 60% / 0.12)',
                      border: '1px solid hsl(270 100% 60% / 0.2)',
                    }}
                  >
                    ⛏️
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate" style={{ color: 'hsl(270 80% 88%)' }}>
                      {product.name}
                    </div>
                    {product.badge && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{
                          background: 'hsl(270 100% 55% / 0.15)',
                          border: '1px solid hsl(270 100% 55% / 0.3)',
                          color: 'hsl(270 100% 75%)',
                        }}
                      >
                        {product.badge}
                      </span>
                    )}
                    <div className="font-black text-sm mt-0.5" style={{ color: 'hsl(270 100% 68%)' }}>
                      ₹{product.price}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => onCheckout(product)}
                      className="btn-primary text-xs px-3 py-1.5 rounded-lg"
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        color: 'hsl(0 70% 60%)',
                        background: 'hsl(0 70% 50% / 0.1)',
                        border: '1px solid hsl(0 70% 50% / 0.2)',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — total */}
        {cart.length > 0 && (
          <div
            className="shrink-0 px-5 py-4"
            style={{ borderTop: '1px solid hsl(270 40% 15%)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'hsl(270 30% 55%)' }}>
                Total ({cart.length} item{cart.length !== 1 ? 's' : ''})
              </span>
              <span className="text-xl font-black" style={{ color: 'hsl(270 100% 70%)' }}>
                ₹{total}
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: 'hsl(270 20% 42%)' }}>
              Each item is purchased separately via UPI.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
