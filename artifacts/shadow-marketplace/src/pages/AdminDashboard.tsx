/* ──────────────────────────────────────────────────────────
   AdminDashboard.tsx — Admin dashboard with email delivery log
   ────────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import {
  getProducts, getOrders, addProduct, deleteProduct, deliverOrder,
} from '@/lib/storage';
import { getEmailLog, addEmailLogEntry, deleteEmailLogEntry } from '@/lib/emailLog';
import type { Product, Order } from '@/lib/storage';
import type { EmailLogEntry } from '@/lib/emailLog';

type Section = 'overview' | 'products' | 'orders' | 'emaillog';

export default function AdminDashboard() {
  const [section, setSection]   = useState<Section>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders]     = useState<Order[]>([]);
  const [emailLog, setEmailLog] = useState<EmailLogEntry[]>([]);

  function refresh() {
    setProducts(getProducts());
    setOrders(getOrders());
    setEmailLog(getEmailLog());
  }

  useEffect(() => { refresh(); }, []);

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const totalRevenue = orders.filter(o => o.status === 'Verified').reduce((s, o) => s + o.amount, 0);

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="w-56 shrink-0 flex flex-col gap-1 py-6 px-3"
        style={{ background: 'hsl(240 18% 6%)', borderRight: '1px solid hsl(270 40% 14%)' }}>
        <p className="text-xs font-bold uppercase tracking-widest px-3 mb-3" style={{ color: 'hsl(270 40% 45%)' }}>
          Admin Panel
        </p>

        {([
          { id: 'overview',  icon: '📊', label: 'Overview' },
          { id: 'products',  icon: '📦', label: 'Products' },
          { id: 'orders',    icon: '📋', label: 'Orders',   badge: pendingCount > 0 ? pendingCount : undefined },
          { id: 'emaillog',  icon: '📧', label: 'Email Log', badge: emailLog.length > 0 ? emailLog.length : undefined },
        ] as { id: Section; icon: string; label: string; badge?: number }[]).map(item => (
          <SidebarItem key={item.id} icon={item.icon} label={item.label}
            active={section === item.id} badge={item.badge}
            onClick={() => setSection(item.id)} />
        ))}

        <div className="mt-auto px-3 pt-4">
          <div className="rounded-xl p-3 text-center"
            style={{ background: 'hsl(270 100% 60% / 0.06)', border: '1px solid hsl(270 60% 18%)' }}>
            <div className="text-xs font-bold" style={{ color: 'hsl(270 100% 70%)' }}>Shadow Admin</div>
            <div className="text-xs mt-0.5" style={{ color: 'hsl(270 30% 50%)' }}>Full control panel</div>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────── */}
      <main className="flex-1 px-6 py-6 overflow-y-auto">
        {section === 'overview' && (
          <Overview products={products} orders={orders} emailLog={emailLog}
            pendingCount={pendingCount} totalRevenue={totalRevenue} onNavigate={setSection} />
        )}
        {section === 'products' && <ProductsSection products={products} onRefresh={refresh} />}
        {section === 'orders'   && <OrdersSection orders={orders} onRefresh={refresh} />}
        {section === 'emaillog' && <EmailLogSection emailLog={emailLog} onRefresh={refresh} />}
      </main>
    </div>
  );
}

/* ── Sidebar item ──────────────────────────────────────── */
function SidebarItem({ icon, label, active, badge, onClick }: {
  icon: string; label: string; active: boolean; badge?: number; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left"
      style={{
        background: active ? 'linear-gradient(135deg, hsl(270 100% 45% / 0.2), hsl(270 100% 60% / 0.1))' : 'transparent',
        color: active ? 'hsl(270 100% 80%)' : 'hsl(270 30% 55%)',
        border: active ? '1px solid hsl(270 60% 28%)' : '1px solid transparent',
      }}>
      <span>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'hsl(40 100% 50%)', color: 'hsl(0 0% 10%)' }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

/* ── Overview ──────────────────────────────────────────── */
function Overview({ products, orders, emailLog, pendingCount, totalRevenue, onNavigate }: {
  products: Product[]; orders: Order[]; emailLog: EmailLogEntry[];
  pendingCount: number; totalRevenue: number; onNavigate: (s: Section) => void;
}) {
  const stats = [
    { icon: '📦', label: 'Products',          value: products.length,        color: 'hsl(270 100% 65%)' },
    { icon: '📋', label: 'Total Orders',       value: orders.length,          color: 'hsl(200 100% 60%)' },
    { icon: '⏳', label: 'Pending',            value: pendingCount,           color: 'hsl(40 100% 55%)' },
    { icon: '💰', label: 'Verified Revenue',   value: `₹${totalRevenue}`,    color: 'hsl(145 70% 55%)' },
    { icon: '📧', label: 'Emails Sent',        value: emailLog.length,        color: 'hsl(200 80% 65%)' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'hsl(270 100% 88%)' }}>Dashboard Overview</h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(270 30% 50%)' }}>Welcome back, Admin.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: 'hsl(240 18% 8%)', border: '1px solid hsl(270 30% 14%)' }}>
            <span className="text-2xl">{s.icon}</span>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'hsl(270 20% 50%)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'hsl(270 40% 50%)' }}>Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onNavigate('products')} className="btn-primary px-5 py-2.5 rounded-xl text-sm">+ Add Product</button>
          <button onClick={() => onNavigate('orders')} className="btn-secondary px-5 py-2.5 rounded-xl text-sm">
            Orders {pendingCount > 0 && `(${pendingCount} pending)`}
          </button>
          <button onClick={() => onNavigate('emaillog')} className="btn-secondary px-5 py-2.5 rounded-xl text-sm">
            📧 Email Log ({emailLog.length})
          </button>
        </div>
      </div>

      {orders.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: 'hsl(270 40% 50%)' }}>Recent Orders</h2>
          <div className="flex flex-col gap-2">
            {orders.slice(0, 5).map(o => <CompactOrderRow key={o.id} order={o} />)}
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
    setAddErr(''); setAddSuccess(true);
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'hsl(270 100% 88%)' }}>Products</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(270 30% 50%)' }}>{products.length} listings</p>
        </div>
        <button onClick={() => setShowForm(p => !p)} className="btn-primary px-5 py-2.5 rounded-xl text-sm">
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-5 animate-slide-down"
          style={{ background: 'hsl(240 20% 7%)', border: '1px solid hsl(270 60% 22%)' }}>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'hsl(270 60% 65%)' }}>New Product</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Product Name *" value={newName} onChange={setNewName} placeholder="e.g. Void Elite" />
            <FormField label="Price (₹) *" value={newPrice} onChange={setNewPrice} placeholder="e.g. 499" type="number" />
            <FormField label="Description" value={newDesc} onChange={setNewDesc} placeholder="Short description" className="sm:col-span-2" />
            <FormField label="Badge (optional)" value={newBadge} onChange={setNewBadge} placeholder="e.g. New, Rare, Popular" />
          </div>
          {addErr     && <p className="text-xs mt-3" style={{ color: 'hsl(0 84% 65%)' }}>{addErr}</p>}
          {addSuccess && <p className="text-xs mt-3" style={{ color: 'hsl(145 70% 55%)' }}>✓ Product added!</p>}
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2.5 rounded-xl text-sm">Cancel</button>
            <button onClick={handleAdd} className="btn-primary px-5 py-2.5 rounded-xl text-sm">Add Product</button>
          </div>
        </div>
      )}

      {products.length === 0 ? <Empty label="No products yet." /> : (
        <div className="flex flex-col gap-2">
          <div className="grid gap-3 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
            style={{ gridTemplateColumns: '1fr 80px 100px 80px', color: 'hsl(270 40% 50%)', background: 'hsl(240 20% 7%)' }}>
            <span>Product</span><span>Badge</span><span>Price</span><span>Action</span>
          </div>
          {products.map(p => (
            <div key={p.id} className="grid gap-3 px-4 py-3 rounded-xl items-center"
              style={{ gridTemplateColumns: '1fr 80px 100px 80px', background: 'hsl(240 15% 8%)', border: '1px solid hsl(270 30% 13%)' }}>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'hsl(270 80% 85%)' }}>{p.name}</div>
                {p.description && <div className="text-xs mt-0.5 truncate" style={{ color: 'hsl(270 20% 48%)' }}>{p.description}</div>}
              </div>
              <div>
                {p.badge
                  ? <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'hsl(270 100% 55% / 0.15)', border: '1px solid hsl(270 100% 55% / 0.3)', color: 'hsl(270 100% 75%)' }}>{p.badge}</span>
                  : <span style={{ color: 'hsl(270 20% 40%)' }}>—</span>}
              </div>
              <div className="font-bold" style={{ color: 'hsl(270 100% 70%)' }}>₹{p.price}</div>
              <button onClick={() => handleDelete(p.id)} className="btn-danger px-3 py-1.5 rounded-lg text-xs">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Orders section ─────────────────────────────────────── */
interface JustDelivered {
  orderId: string;
  customerEmail: string;
  productName: string;
  accountUsername: string;
  accountPassword: string;
}

function buildGmailLink(d: JustDelivered): string {
  const subject = encodeURIComponent(`Your ${d.productName} — Shadow Marketplace`);
  const body = encodeURIComponent(
    `Hi,\n\nYour payment has been verified and your Minecraft account is ready!\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Product: ${d.productName}\n` +
    `Username: ${d.accountUsername}\n` +
    `Password: ${d.accountPassword}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Please change your password after first login.\n\n` +
    `Thank you for shopping at Shadow Marketplace!\n` +
    `— Shadow Market Team`,
  );
  return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(d.customerEmail)}&su=${subject}&body=${body}`;
}

function OrdersSection({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
  const [deliveringId, setDeliveringId]     = useState<string | null>(null);
  const [accUser, setAccUser]               = useState('');
  const [accPass, setAccPass]               = useState('');
  const [showPass, setShowPass]             = useState(false);
  const [deliverErr, setDeliverErr]         = useState('');
  const [justDelivered, setJustDelivered]   = useState<JustDelivered | null>(null);

  function openDeliverForm(id: string) {
    setDeliveringId(id);
    setJustDelivered(null);
    setAccUser(''); setAccPass(''); setShowPass(false); setDeliverErr('');
  }

  function handleDeliver() {
    if (!accUser.trim()) return setDeliverErr('Minecraft username is required.');
    if (!accPass.trim()) return setDeliverErr('Password is required.');
    if (!deliveringId) return;

    const order = orders.find(o => o.id === deliveringId)!;

    deliverOrder(deliveringId, accUser.trim(), accPass.trim());

    addEmailLogEntry({
      orderId:         deliveringId,
      productName:     order.productName,
      customerEmail:   order.customerEmail,
      accountUsername: accUser.trim(),
      accountPassword: accPass.trim(),
    });

    setJustDelivered({
      orderId:         deliveringId,
      customerEmail:   order.customerEmail,
      productName:     order.productName,
      accountUsername: accUser.trim(),
      accountPassword: accPass.trim(),
    });

    setDeliveringId(null);
    onRefresh();
  }

  const pending  = orders.filter(o => o.status === 'Pending');
  const verified = orders.filter(o => o.status === 'Verified');

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'hsl(270 100% 88%)' }}>Orders</h1>
        <p className="text-sm mt-0.5" style={{ color: 'hsl(270 30% 50%)' }}>
          {pending.length} pending · {verified.length} delivered
        </p>
      </div>

      {/* ── Just-delivered Gmail banner ─────────── */}
      {justDelivered && (
        <div className="rounded-2xl p-4 animate-slide-down flex flex-col gap-3"
          style={{ background: 'hsl(145 60% 40% / 0.08)', border: '2px solid hsl(145 60% 45% / 0.5)', boxShadow: '0 0 20px hsl(145 60% 40% / 0.1)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <div>
              <div className="text-sm font-bold" style={{ color: 'hsl(145 70% 60%)' }}>
                Account delivered — now send the credentials via email
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'hsl(145 40% 50%)' }}>
                To: <span className="font-semibold">{justDelivered.customerEmail}</span>
                &nbsp;·&nbsp;{justDelivered.productName}
                &nbsp;·&nbsp;{justDelivered.accountUsername} / {justDelivered.accountPassword}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={buildGmailLink(justDelivered)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: '#EA433518', border: '1px solid #EA433555', color: '#EA4335' }}
            >
              <span>✉️</span> Open Gmail & Send
            </a>
            <button
              onClick={() => setJustDelivered(null)}
              className="px-4 py-2 rounded-xl text-xs"
              style={{ background: 'hsl(145 20% 15%)', border: '1px solid hsl(145 30% 20%)', color: 'hsl(145 30% 50%)' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {orders.length === 0 ? <Empty label="No orders yet." /> : (
        <div className="flex flex-col gap-3">
          {orders.map(o => (
            <div key={o.id}>
              <div className="rounded-xl px-4 py-3 flex flex-col gap-2"
                style={{ background: 'hsl(240 15% 8%)', border: `1px solid ${o.status === 'Pending' ? 'hsl(40 100% 50% / 0.2)' : 'hsl(145 60% 40% / 0.2)'}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: 'hsl(270 80% 88%)' }}>{o.productName}</div>
                    <div className="text-xs font-mono mt-0.5" style={{ color: 'hsl(270 20% 48%)' }}>TxID: {o.transactionId}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs" style={{ color: 'hsl(200 60% 55%)' }}>📧</span>
                      <span className="text-xs font-medium" style={{ color: 'hsl(200 60% 65%)' }}>{o.customerEmail}</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'hsl(270 20% 42%)' }}>
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-black text-sm" style={{ color: 'hsl(270 100% 70%)' }}>₹{o.amount}</span>
                    {o.status === 'Pending'
                      ? <span className="badge-pending text-xs px-2.5 py-1 rounded-full font-bold">⏳ Pending</span>
                      : <span className="badge-verified text-xs px-2.5 py-1 rounded-full font-bold">✓ Delivered</span>}
                  </div>
                </div>

                {/* Delivered credentials + resend Gmail link */}
                {o.accountUsername && (
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg font-mono text-xs"
                    style={{ background: 'hsl(145 60% 40% / 0.06)', border: '1px solid hsl(145 60% 40% / 0.2)', color: 'hsl(145 70% 55%)' }}>
                    <span>
                      <span className="font-bold">{o.accountUsername}</span> / {o.accountPassword}
                      {o.deliveredAt && <span className="ml-2 opacity-60">· {new Date(o.deliveredAt).toLocaleString()}</span>}
                    </span>
                    <a
                      href={buildGmailLink({
                        orderId: o.id,
                        customerEmail: o.customerEmail,
                        productName: o.productName,
                        accountUsername: o.accountUsername!,
                        accountPassword: o.accountPassword!,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-sans font-semibold not-italic"
                      style={{ background: '#EA433518', border: '1px solid #EA433555', color: '#EA4335', fontSize: '0.65rem' }}
                    >
                      ✉️ Resend via Gmail
                    </a>
                  </div>
                )}

                {/* Deliver button */}
                {o.status === 'Pending' && deliveringId !== o.id && (
                  <button onClick={() => openDeliverForm(o.id)}
                    className="self-start text-xs px-4 py-1.5 rounded-lg font-semibold"
                    style={{ background: 'hsl(270 100% 55% / 0.15)', border: '1px solid hsl(270 100% 55% / 0.4)', color: 'hsl(270 100% 75%)' }}>
                    📧 Send Account Details
                  </button>
                )}
              </div>

              {/* Inline delivery form */}
              {deliveringId === o.id && (
                <div className="mt-2 rounded-xl p-4 animate-slide-down"
                  style={{ background: 'hsl(240 20% 7%)', border: '1px solid hsl(270 60% 25%)' }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'hsl(270 60% 65%)' }}>
                    Send Account to {o.customerEmail}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Minecraft Username *" value={accUser} onChange={setAccUser} placeholder="e.g. ShadowPlayer99" />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(270 50% 60%)' }}>
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={accPass}
                          onChange={e => setAccPass(e.target.value)}
                          placeholder="Account password"
                          className="input-field px-3 py-2.5 rounded-lg text-sm w-full pr-9"
                        />
                        <button type="button" onClick={() => setShowPass(p => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2"
                          style={{ color: 'hsl(270 30% 50%)' }} tabIndex={-1}>
                          {showPass ? '🙈' : '👁'}
                        </button>
                      </div>
                    </div>
                  </div>
                  {deliverErr && <p className="text-xs mt-2" style={{ color: 'hsl(0 84% 65%)' }}>{deliverErr}</p>}
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => setDeliveringId(null)} className="btn-secondary px-4 py-2 rounded-lg text-xs">Cancel</button>
                    <button onClick={handleDeliver} className="btn-primary px-5 py-2 rounded-lg text-xs">
                      ✓ Verify & Send Account
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'hsl(270 20% 40%)' }}>
                    Saves to Email Log. You can then send credentials via Gmail.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Email Log section ─────────────────────────────────── */
function EmailLogSection({ emailLog, onRefresh }: { emailLog: EmailLogEntry[]; onRefresh: () => void }) {
  const [showPassId, setShowPassId] = useState<string | null>(null);

  function handleDelete(id: string) {
    if (!confirm('Remove this log entry?')) return;
    deleteEmailLogEntry(id);
    onRefresh();
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'hsl(270 100% 88%)' }}>Email Log</h1>
        <p className="text-sm mt-0.5" style={{ color: 'hsl(270 30% 50%)' }}>
          Record of every account sent to customers — {emailLog.length} entr{emailLog.length === 1 ? 'y' : 'ies'}
        </p>
      </div>

      {emailLog.length === 0 ? (
        <Empty label="No emails sent yet. Deliver an order to create a log entry." />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Column headers */}
          <div className="grid gap-3 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
            style={{ gridTemplateColumns: '1fr 140px 140px auto', color: 'hsl(270 40% 50%)', background: 'hsl(240 20% 7%)' }}>
            <span>Customer / Product</span>
            <span>MC Username</span>
            <span>Password</span>
            <span>Sent At</span>
          </div>

          {emailLog.map(entry => (
            <div key={entry.id}
              className="grid gap-3 px-4 py-3 rounded-xl items-center"
              style={{ gridTemplateColumns: '1fr 140px 140px auto', background: 'hsl(240 15% 8%)', border: '1px solid hsl(200 40% 16%)' }}>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'hsl(270 80% 85%)' }}>{entry.productName}</div>
                <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'hsl(200 60% 60%)' }}>
                  <span>📧</span><span>{entry.customerEmail}</span>
                </div>
              </div>
              <div className="font-mono text-sm font-bold" style={{ color: 'hsl(145 70% 60%)' }}>
                {entry.accountUsername}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm" style={{ color: 'hsl(270 50% 65%)' }}>
                  {showPassId === entry.id ? entry.accountPassword : '••••••••'}
                </span>
                <button onClick={() => setShowPassId(showPassId === entry.id ? null : entry.id)}
                  className="text-xs shrink-0" style={{ color: 'hsl(270 30% 50%)' }} title="Toggle visibility">
                  {showPassId === entry.id ? '🙈' : '👁'}
                </button>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="text-xs whitespace-nowrap" style={{ color: 'hsl(270 20% 45%)' }}>
                  {new Date(entry.sentAt).toLocaleDateString()}
                </div>
                <div className="text-xs whitespace-nowrap" style={{ color: 'hsl(270 20% 38%)' }}>
                  {new Date(entry.sentAt).toLocaleTimeString()}
                </div>
                <button onClick={() => handleDelete(entry.id)}
                  className="text-xs mt-0.5" style={{ color: 'hsl(0 70% 55%)' }} title="Delete log entry">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Compact order row (overview) ───────────────────────── */
function CompactOrderRow({ order: o }: { order: Order }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
      style={{ background: 'hsl(240 15% 8%)', border: '1px solid hsl(270 30% 12%)' }}>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate" style={{ color: 'hsl(270 80% 85%)' }}>{o.productName}</div>
        <div className="text-xs" style={{ color: 'hsl(200 60% 60%)' }}>{o.customerEmail}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-bold text-sm" style={{ color: 'hsl(270 100% 70%)' }}>₹{o.amount}</span>
        {o.status === 'Pending'
          ? <span className="badge-pending text-xs px-2.5 py-1 rounded-full font-bold">Pending</span>
          : <span className="badge-verified text-xs px-2.5 py-1 rounded-full font-bold">Delivered</span>}
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────── */
function FormField({ label, value, onChange, placeholder, type = 'text', className = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(270 50% 60%)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className="input-field px-3 py-2.5 rounded-lg text-sm" />
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl flex flex-col items-center gap-3 py-16 text-center"
      style={{ background: 'hsl(240 15% 7%)', border: '1px dashed hsl(270 30% 18%)' }}>
      <span className="text-4xl">📭</span>
      <p className="text-sm" style={{ color: 'hsl(270 30% 50%)' }}>{label}</p>
    </div>
  );
}
