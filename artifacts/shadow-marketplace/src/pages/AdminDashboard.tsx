/* ──────────────────────────────────────────────────────────
   AdminDashboard.tsx — Full admin dashboard page with sidebar
   ────────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import {
  getProducts, getOrders, addProduct, deleteProduct, markOrderVerified,
} from '@/lib/storage';
import type { Product, Order } from '@/lib/storage';

type Section = 'overview' | 'products' | 'orders';

export default function AdminDashboard() {
  const [section, setSection]   = useState<Section>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders]     = useState<Order[]>([]);

  function refresh() {
    setProducts(getProducts());
    setOrders(getOrders());
  }

  useEffect(() => { refresh(); }, []);

  const pendingCount  = orders.filter(o => o.status === 'Pending').length;
  const totalRevenue  = orders.filter(o => o.status === 'Verified').reduce((s, o) => s + o.amount, 0);

  return (
    <div className="flex min-h-[calc(100vh-56px)]">

      {/* ── Sidebar ──────────────────────────────── */}
      <aside
        className="w-56 shrink-0 flex flex-col gap-1 py-6 px-3"
        style={{
          background: 'hsl(240 18% 6%)',
          borderRight: '1px solid hsl(270 40% 14%)',
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest px-3 mb-3"
          style={{ color: 'hsl(270 40% 45%)' }}
        >
          Admin Panel
        </p>

        {([
          { id: 'overview', icon: '📊', label: 'Overview' },
          { id: 'products', icon: '📦', label: 'Products' },
          { id: 'orders',   icon: '📋', label: 'Orders' },
        ] as { id: Section; icon: string; label: string }[]).map(item => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={section === item.id}
            badge={item.id === 'orders' && pendingCount > 0 ? pendingCount : undefined}
            onClick={() => setSection(item.id)}
          />
        ))}

        {/* Bottom info */}
        <div className="mt-auto px-3 pt-4">
          <div
            className="rounded-xl p-3 text-center"
            style={{ background: 'hsl(270 100% 60% / 0.06)', border: '1px solid hsl(270 60% 18%)' }}
          >
            <div className="text-xs font-bold" style={{ color: 'hsl(270 100% 70%)' }}>
              Shadow Admin
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'hsl(270 30% 50%)' }}>
              Full control panel
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────── */}
      <main className="flex-1 px-6 py-6 overflow-y-auto">

        {section === 'overview' && (
          <Overview
            products={products}
            orders={orders}
            pendingCount={pendingCount}
            totalRevenue={totalRevenue}
            onNavigate={setSection}
          />
        )}

        {section === 'products' && (
          <ProductsSection products={products} onRefresh={refresh} />
        )}

        {section === 'orders' && (
          <OrdersSection orders={orders} onRefresh={refresh} />
        )}
      </main>
    </div>
  );
}

/* ── Sidebar item ──────────────────────────────────────── */
function SidebarItem({
  icon, label, active, badge, onClick,
}: {
  icon: string; label: string; active: boolean; badge?: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left relative"
      style={{
        background: active
          ? 'linear-gradient(135deg, hsl(270 100% 45% / 0.2), hsl(270 100% 60% / 0.1))'
          : 'transparent',
        color: active ? 'hsl(270 100% 80%)' : 'hsl(270 30% 55%)',
        border: active ? '1px solid hsl(270 60% 28%)' : '1px solid transparent',
      }}
    >
      <span>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span
          className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'hsl(40 100% 50%)', color: 'hsl(0 0% 10%)' }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ── Overview section ──────────────────────────────────── */
function Overview({
  products, orders, pendingCount, totalRevenue, onNavigate,
}: {
  products: Product[];
  orders: Order[];
  pendingCount: number;
  totalRevenue: number;
  onNavigate: (s: Section) => void;
}) {
  const stats = [
    { icon: '📦', label: 'Products Listed', value: products.length, color: 'hsl(270 100% 65%)' },
    { icon: '📋', label: 'Total Orders', value: orders.length, color: 'hsl(200 100% 60%)' },
    { icon: '⏳', label: 'Pending Verification', value: pendingCount, color: 'hsl(40 100% 55%)' },
    { icon: '💰', label: 'Verified Revenue', value: `₹${totalRevenue}`, color: 'hsl(145 70% 55%)' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'hsl(270 100% 88%)' }}>Dashboard Overview</h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(270 30% 50%)' }}>Welcome back, Admin.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div
            key={s.label}
            className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: 'hsl(240 18% 8%)', border: '1px solid hsl(270 30% 14%)' }}
          >
            <span className="text-2xl">{s.icon}</span>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'hsl(270 20% 50%)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'hsl(270 40% 50%)' }}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onNavigate('products')} className="btn-primary px-5 py-2.5 rounded-xl text-sm">
            + Add Product
          </button>
          <button onClick={() => onNavigate('orders')} className="btn-secondary px-5 py-2.5 rounded-xl text-sm">
            View Orders {pendingCount > 0 && `(${pendingCount} pending)`}
          </button>
        </div>
      </div>

      {/* Recent orders */}
      {orders.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'hsl(270 40% 50%)' }}>
            Recent Orders
          </h2>
          <div className="flex flex-col gap-2">
            {orders.slice(0, 5).map(o => (
              <OrderRow key={o.id} order={o} onVerify={() => {}} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Products section ──────────────────────────────────── */
function ProductsSection({ products, onRefresh }: { products: Product[]; onRefresh: () => void }) {
  const [newName, setNewName]   = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc]   = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [addErr, setAddErr]     = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function handleAdd() {
    if (!newName.trim()) return setAddErr('Name is required.');
    const price = Number(newPrice);
    if (!newPrice || isNaN(price) || price <= 0) return setAddErr('Enter a valid price.');
    addProduct({ name: newName.trim(), price, description: newDesc.trim(), badge: newBadge.trim() });
    setNewName(''); setNewPrice(''); setNewDesc(''); setNewBadge('');
    setAddErr('');
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2500);
    setShowForm(false);
    onRefresh();
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    deleteProduct(id);
    onRefresh();
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'hsl(270 100% 88%)' }}>Products</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(270 30% 50%)' }}>
            {products.length} listings
          </p>
        </div>
        <button
          onClick={() => setShowForm(p => !p)}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm"
        >
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add product form — slide panel */}
      {showForm && (
        <div
          className="rounded-2xl p-5 animate-slide-down"
          style={{ background: 'hsl(240 20% 7%)', border: '1px solid hsl(270 60% 22%)' }}
        >
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'hsl(270 60% 65%)' }}>
            New Product
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Product Name *" value={newName} onChange={setNewName} placeholder="e.g. Void Elite" />
            <FormField label="Price (₹) *" value={newPrice} onChange={setNewPrice} placeholder="e.g. 499" type="number" />
            <FormField label="Description" value={newDesc} onChange={setNewDesc} placeholder="Short description" className="sm:col-span-2" />
            <FormField label="Badge (optional)" value={newBadge} onChange={setNewBadge} placeholder="e.g. New, Rare, Popular" />
          </div>
          {addErr     && <p className="text-xs mt-3" style={{ color: 'hsl(0 84% 65%)' }}>{addErr}</p>}
          {addSuccess && <p className="text-xs mt-3" style={{ color: 'hsl(145 70% 55%)' }}>✓ Product added!</p>}
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2.5 rounded-xl text-sm">
              Cancel
            </button>
            <button onClick={handleAdd} className="btn-primary px-5 py-2.5 rounded-xl text-sm">
              Add Product
            </button>
          </div>
        </div>
      )}

      {/* Product list */}
      {products.length === 0 ? (
        <Empty label="No products yet. Add one above." />
      ) : (
        <div className="flex flex-col gap-2">
          {/* Table header */}
          <div
            className="grid gap-3 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
            style={{
              gridTemplateColumns: '1fr 80px 100px 80px',
              color: 'hsl(270 40% 50%)',
              background: 'hsl(240 20% 7%)',
            }}
          >
            <span>Product</span>
            <span>Badge</span>
            <span>Price</span>
            <span>Action</span>
          </div>

          {products.map(p => (
            <div
              key={p.id}
              className="grid gap-3 px-4 py-3 rounded-xl items-center transition-colors"
              style={{
                gridTemplateColumns: '1fr 80px 100px 80px',
                background: 'hsl(240 15% 8%)',
                border: '1px solid hsl(270 30% 13%)',
              }}
            >
              <div>
                <div className="font-semibold text-sm" style={{ color: 'hsl(270 80% 85%)' }}>{p.name}</div>
                {p.description && (
                  <div className="text-xs mt-0.5 truncate" style={{ color: 'hsl(270 20% 48%)' }}>{p.description}</div>
                )}
              </div>
              <div>
                {p.badge ? (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: 'hsl(270 100% 55% / 0.15)', border: '1px solid hsl(270 100% 55% / 0.3)', color: 'hsl(270 100% 75%)' }}
                  >
                    {p.badge}
                  </span>
                ) : (
                  <span style={{ color: 'hsl(270 20% 40%)' }}>—</span>
                )}
              </div>
              <div className="font-bold" style={{ color: 'hsl(270 100% 70%)' }}>₹{p.price}</div>
              <button
                onClick={() => handleDelete(p.id)}
                className="btn-danger px-3 py-1.5 rounded-lg text-xs"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Orders section ─────────────────────────────────────── */
function OrdersSection({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
  function handleVerify(id: string) {
    markOrderVerified(id);
    onRefresh();
  }

  const pending  = orders.filter(o => o.status === 'Pending');
  const verified = orders.filter(o => o.status === 'Verified');

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'hsl(270 100% 88%)' }}>Orders</h1>
        <p className="text-sm mt-0.5" style={{ color: 'hsl(270 30% 50%)' }}>
          {pending.length} pending · {verified.length} verified
        </p>
      </div>

      {orders.length === 0 ? (
        <Empty label="No orders yet." />
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map(o => (
            <OrderRow key={o.id} order={o} onVerify={handleVerify} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order: o, onVerify, compact,
}: {
  order: Order;
  onVerify: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
      style={{ background: 'hsl(240 15% 8%)', border: '1px solid hsl(270 30% 12%)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate" style={{ color: 'hsl(270 80% 85%)' }}>{o.productName}</div>
        {!compact && (
          <div className="text-xs mt-0.5 font-mono" style={{ color: 'hsl(270 20% 48%)' }}>
            TxID: {o.transactionId}
          </div>
        )}
        <div className="text-xs" style={{ color: 'hsl(270 20% 42%)' }}>
          {new Date(o.createdAt).toLocaleString()}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-bold text-sm" style={{ color: 'hsl(270 100% 70%)' }}>₹{o.amount}</span>
        {o.status === 'Pending' ? (
          <span className="badge-pending text-xs px-2.5 py-1 rounded-full font-bold">Pending</span>
        ) : (
          <span className="badge-verified text-xs px-2.5 py-1 rounded-full font-bold">Verified</span>
        )}
        {o.status === 'Pending' && !compact && (
          <button
            onClick={() => onVerify(o.id)}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
            style={{
              background: 'hsl(145 60% 40% / 0.15)',
              border: '1px solid hsl(145 60% 40% / 0.4)',
              color: 'hsl(145 70% 55%)',
            }}
          >
            ✓ Verify
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Small helpers ─────────────────────────────────────── */
function FormField({
  label, value, onChange, placeholder, type = 'text', className = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(270 50% 60%)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field px-3 py-2.5 rounded-lg text-sm"
      />
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div
      className="rounded-2xl flex flex-col items-center gap-3 py-16 text-center"
      style={{ background: 'hsl(240 15% 7%)', border: '1px dashed hsl(270 30% 18%)' }}
    >
      <span className="text-4xl">📭</span>
      <p className="text-sm" style={{ color: 'hsl(270 30% 50%)' }}>{label}</p>
    </div>
  );
}
