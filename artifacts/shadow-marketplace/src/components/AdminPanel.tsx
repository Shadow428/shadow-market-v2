/* ──────────────────────────────────────────────────────────
   AdminPanel.tsx — Hidden admin panel (Ctrl+Shift+A)
   ────────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import {
  getProducts, getOrders, addProduct, deleteProduct, markOrderVerified,
} from '@/lib/storage';
import type { Product, Order } from '@/lib/storage';

interface Props {
  onClose: () => void;
}

type AdminTab = 'products' | 'orders';

export default function AdminPanel({ onClose }: Props) {
  const [authed, setAuthed]     = useState(false);
  const [pass, setPass]         = useState('');
  const [passErr, setPassErr]   = useState('');
  const [tab, setTab]           = useState<AdminTab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders]     = useState<Order[]>([]);

  /* Add product form */
  const [newName, setNewName]   = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc]   = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [addErr, setAddErr]     = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  function refresh() {
    setProducts(getProducts());
    setOrders(getOrders());
  }

  useEffect(() => {
    if (authed) refresh();
  }, [authed]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleLogin() {
    const stored = localStorage.getItem('sm_admin_pass') ?? 'shadow123';
    if (pass === stored) {
      setAuthed(true);
    } else {
      setPassErr('Incorrect password. Access denied.');
    }
  }

  function handleAddProduct() {
    if (!newName.trim())               return setAddErr('Product name is required.');
    const price = Number(newPrice);
    if (!newPrice || isNaN(price) || price <= 0) return setAddErr('Enter a valid price.');
    addProduct({ name: newName.trim(), price, description: newDesc.trim(), badge: newBadge.trim() });
    setNewName(''); setNewPrice(''); setNewDesc(''); setNewBadge('');
    setAddErr('');
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2500);
    refresh();
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    deleteProduct(id);
    refresh();
  }

  function handleVerify(id: string) {
    markOrderVerified(id);
    refresh();
  }

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-panel rounded-2xl w-full animate-scale-in flex flex-col"
        style={{ maxWidth: authed ? '800px' : '420px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid hsl(270 40% 18%)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <h2 className="font-bold text-lg" style={{ color: 'hsl(270 100% 85%)' }}>
              Admin Panel
            </h2>
            {authed && <span className="badge-verified text-xs px-2 py-0.5 rounded-full font-bold ml-1">AUTHED</span>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ color: 'hsl(270 30% 55%)', background: 'hsl(270 20% 12%)' }}
          >
            ✕
          </button>
        </div>

        {/* ── Login ──────────────────────────────── */}
        {!authed && (
          <div className="px-6 py-8 flex flex-col items-center gap-5">
            <div className="text-4xl">🔑</div>
            <p className="text-sm text-center" style={{ color: 'hsl(270 30% 60%)' }}>
              Enter admin password to access the control panel.
              <br/>
              <span className="text-xs opacity-60">Default: shadow123</span>
            </p>
            <div className="w-full flex flex-col gap-2">
              <input
                type="password"
                value={pass}
                onChange={(e) => { setPass(e.target.value); setPassErr(''); }}
                placeholder="Admin password"
                className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm"
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                autoFocus
              />
              {passErr && <p className="text-xs" style={{ color: 'hsl(0 84% 65%)' }}>{passErr}</p>}
            </div>
            <button onClick={handleLogin} className="btn-primary w-full py-3 rounded-xl text-sm">
              Authenticate
            </button>
          </div>
        )}

        {/* ── Authenticated ──────────────────────── */}
        {authed && (
          <>
            {/* Tabs */}
            <div
              className="flex px-6 pt-4 gap-2 shrink-0"
              style={{ borderBottom: '1px solid hsl(270 40% 15%)' }}
            >
              {(['products', 'orders'] as AdminTab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-4 py-2 rounded-t-lg text-sm font-semibold capitalize transition-colors pb-3"
                  style={{
                    color: tab === t ? 'hsl(270 100% 80%)' : 'hsl(270 30% 55%)',
                    borderBottom: tab === t ? '2px solid hsl(270 100% 60%)' : '2px solid transparent',
                    background: tab === t ? 'hsl(270 100% 60% / 0.08)' : 'transparent',
                  }}
                >
                  {t === 'products' ? '📦 Products' : '📋 Orders'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="overflow-y-auto flex-1 px-6 py-5">

              {/* Products tab */}
              {tab === 'products' && (
                <div className="flex flex-col gap-6">
                  {/* Add product form */}
                  <div
                    className="rounded-xl p-4 flex flex-col gap-3"
                    style={{ background: 'hsl(270 20% 7%)', border: '1px solid hsl(270 40% 16%)' }}
                  >
                    <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'hsl(270 60% 65%)' }}>
                      Add Product
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs" style={{ color: 'hsl(270 30% 55%)' }}>Name *</label>
                        <input value={newName} onChange={e => setNewName(e.target.value)}
                          placeholder="Product name" className="input-field px-3 py-2 rounded-lg text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs" style={{ color: 'hsl(270 30% 55%)' }}>Price (₹) *</label>
                        <input value={newPrice} onChange={e => setNewPrice(e.target.value)}
                          placeholder="e.g. 299" type="number" min="1"
                          className="input-field px-3 py-2 rounded-lg text-sm" />
                      </div>
                      <div className="flex flex-col gap-1 col-span-2">
                        <label className="text-xs" style={{ color: 'hsl(270 30% 55%)' }}>Description</label>
                        <input value={newDesc} onChange={e => setNewDesc(e.target.value)}
                          placeholder="Short description" className="input-field px-3 py-2 rounded-lg text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs" style={{ color: 'hsl(270 30% 55%)' }}>Badge (optional)</label>
                        <input value={newBadge} onChange={e => setNewBadge(e.target.value)}
                          placeholder="e.g. New, Rare" className="input-field px-3 py-2 rounded-lg text-sm" />
                      </div>
                      <div className="flex flex-col justify-end">
                        <button onClick={handleAddProduct} className="btn-primary py-2 rounded-lg text-sm">
                          + Add Product
                        </button>
                      </div>
                    </div>
                    {addErr     && <p className="text-xs" style={{ color: 'hsl(0 84% 65%)' }}>{addErr}</p>}
                    {addSuccess && <p className="text-xs" style={{ color: 'hsl(145 70% 55%)' }}>✓ Product added successfully!</p>}
                  </div>

                  {/* Product list */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'hsl(270 60% 65%)' }}>
                      All Products ({products.length})
                    </h3>
                    {products.length === 0 && (
                      <p className="text-sm" style={{ color: 'hsl(270 30% 50%)' }}>No products yet.</p>
                    )}
                    {products.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                        style={{ background: 'hsl(240 15% 8%)', border: '1px solid hsl(270 30% 14%)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm truncate" style={{ color: 'hsl(270 80% 85%)' }}>
                              {p.name}
                            </span>
                            {p.badge && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                                style={{ background: 'hsl(270 100% 50% / 0.2)', color: 'hsl(270 100% 75%)', border: '1px solid hsl(270 100% 50% / 0.3)' }}>
                                {p.badge}
                              </span>
                            )}
                          </div>
                          {p.description && (
                            <p className="text-xs mt-0.5 truncate" style={{ color: 'hsl(270 20% 50%)' }}>{p.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-sm" style={{ color: 'hsl(270 100% 70%)' }}>₹{p.price}</span>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="btn-danger px-3 py-1 rounded-lg text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders tab */}
              {tab === 'orders' && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: 'hsl(270 60% 65%)' }}>
                    All Orders ({orders.length})
                  </h3>
                  {orders.length === 0 && (
                    <p className="text-sm" style={{ color: 'hsl(270 30% 50%)' }}>No orders placed yet.</p>
                  )}
                  {orders.map(o => (
                    <div
                      key={o.id}
                      className="rounded-xl px-4 py-3 flex flex-col gap-2"
                      style={{ background: 'hsl(240 15% 8%)', border: '1px solid hsl(270 30% 14%)' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-sm" style={{ color: 'hsl(270 80% 85%)' }}>{o.productName}</div>
                          <div className="text-xs mt-0.5 font-mono" style={{ color: 'hsl(270 20% 50%)' }}>
                            TxID: {o.transactionId}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: 'hsl(270 20% 45%)' }}>
                            {new Date(o.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="font-bold text-sm" style={{ color: 'hsl(270 100% 70%)' }}>₹{o.amount}</span>
                          {o.status === 'Pending' ? (
                            <span className="badge-pending text-xs px-2 py-0.5 rounded-full font-bold">Pending</span>
                          ) : (
                            <span className="badge-verified text-xs px-2 py-0.5 rounded-full font-bold">Verified</span>
                          )}
                        </div>
                      </div>
                      {o.status === 'Pending' && (
                        <button
                          onClick={() => handleVerify(o.id)}
                          className="self-start text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                          style={{
                            background: 'hsl(145 60% 40% / 0.15)',
                            border: '1px solid hsl(145 60% 40% / 0.4)',
                            color: 'hsl(145 70% 55%)',
                          }}
                        >
                          ✓ Mark Verified
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
