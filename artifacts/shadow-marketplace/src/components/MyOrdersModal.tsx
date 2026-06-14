/* ──────────────────────────────────────────────────────────
   MyOrdersModal.tsx — Buyer's order history modal
   ────────────────────────────────────────────────────────── */
import { useEffect } from 'react';
import { getOrders } from '@/lib/storage';
import type { User } from '@/lib/auth';

interface Props {
  user: User;
  onClose: () => void;
}

export default function MyOrdersModal({ onClose }: Props) {
  const orders = getOrders();

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-panel rounded-2xl w-full max-w-lg animate-scale-in flex flex-col"
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid hsl(270 40% 15%)' }}
        >
          <div>
            <h2 className="font-bold text-lg" style={{ color: 'hsl(270 100% 88%)' }}>My Orders</h2>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(270 30% 50%)' }}>
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ color: 'hsl(270 30% 55%)', background: 'hsl(270 20% 12%)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <span className="text-5xl opacity-40">📋</span>
              <p className="text-sm" style={{ color: 'hsl(270 30% 50%)' }}>
                You haven't placed any orders yet.
                <br />
                Buy an account to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map(o => (
                <div
                  key={o.id}
                  className="rounded-xl p-4 flex flex-col gap-2"
                  style={{ background: 'hsl(240 15% 8%)', border: '1px solid hsl(270 30% 13%)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: 'hsl(270 80% 88%)' }}>
                        {o.productName}
                      </div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: 'hsl(270 20% 48%)' }}>
                        TxID: {o.transactionId}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'hsl(270 20% 40%)' }}>
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-black text-sm" style={{ color: 'hsl(270 100% 70%)' }}>
                        ₹{o.amount}
                      </span>
                      {o.status === 'Pending' ? (
                        <span className="badge-pending text-xs px-2.5 py-1 rounded-full font-bold">
                          ⏳ Pending
                        </span>
                      ) : (
                        <span className="badge-verified text-xs px-2.5 py-1 rounded-full font-bold">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status message */}
                  {o.status === 'Pending' && (
                    <div
                      className="text-xs px-3 py-2 rounded-lg mt-1"
                      style={{
                        background: 'hsl(40 100% 50% / 0.06)',
                        border: '1px solid hsl(40 100% 50% / 0.2)',
                        color: 'hsl(40 100% 60%)',
                      }}
                    >
                      Payment is being verified. Account details will be sent once confirmed.
                    </div>
                  )}
                  {o.status === 'Verified' && (
                    <div
                      className="text-xs px-3 py-2 rounded-lg mt-1"
                      style={{
                        background: 'hsl(145 60% 40% / 0.06)',
                        border: '1px solid hsl(145 60% 40% / 0.2)',
                        color: 'hsl(145 70% 55%)',
                      }}
                    >
                      Payment verified! Your account has been delivered.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
