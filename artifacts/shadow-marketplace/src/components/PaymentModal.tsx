/* ──────────────────────────────────────────────────────────
   PaymentModal.tsx — UPI QR payment flow modal
   ────────────────────────────────────────────────────────── */
import { useState, useEffect } from 'react';
import type { Product } from '@/lib/storage';
import { addOrder } from '@/lib/storage';

interface Props {
  product: Product;
  customerEmail: string;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

const UPI_ID   = 'ekaspalsingh@fam';
const UPI_NAME = 'Ekaspal Singh';

type Step = 'qr' | 'txid' | 'done';

export default function PaymentModal({ product, customerEmail, onClose, onSuccess }: Props) {
  const [step, setStep]     = useState<Step>('qr');
  const [txId, setTxId]     = useState('');
  const [txError, setTxError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handlePaid() {
    if (!txId.trim()) { setTxError('Please enter the UPI transaction ID.'); return; }
    if (txId.trim().length < 6) { setTxError('Transaction ID seems too short.'); return; }
    const order = addOrder({
      productId:     product.id,
      productName:   product.name,
      amount:        product.price,
      transactionId: txId.trim(),
      customerEmail,
      status:        'Pending',
    });
    setStep('done');
    onSuccess(order.id);
  }

  function copyUpiId() {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-panel rounded-2xl w-full max-w-md animate-scale-in relative overflow-hidden">
        <div className="scanline absolute inset-0 pointer-events-none z-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 relative z-10"
          style={{ borderBottom: '1px solid hsl(270 40% 18%)' }}>
          <div>
            <h2 className="font-bold text-lg" style={{ color: 'hsl(270 100% 90%)' }}>Complete Payment</h2>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(270 30% 55%)' }}>{product.name}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ color: 'hsl(270 30% 55%)', background: 'hsl(270 20% 12%)' }}>✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 relative z-10">

          {/* ── QR step ───────────────────────────── */}
          {step === 'qr' && (
            <div className="flex flex-col items-center gap-4">

              {/* Amount */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'hsl(270 30% 55%)' }}>Amount to Pay</p>
                <div className="text-4xl font-black glow-text" style={{ color: 'hsl(270 100% 70%)' }}>₹{product.price}</div>
              </div>

              {/* Real QR image */}
              <div className="rounded-2xl overflow-hidden animate-pulse-glow"
                style={{ border: '2px solid hsl(270 60% 35%)', boxShadow: '0 0 30px hsl(270 100% 50% / 0.15)' }}>
                <img
                  src="/upi-qr.png"
                  alt="UPI QR Code — scan with any UPI app"
                  className="block"
                  style={{ width: 220, height: 'auto' }}
                />
              </div>

              {/* UPI ID + copy button */}
              <div className="w-full flex items-center gap-2 rounded-xl px-4 py-2.5"
                style={{ background: 'hsl(270 100% 60% / 0.08)', border: '1px solid hsl(270 100% 60% / 0.2)' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs" style={{ color: 'hsl(270 40% 55%)' }}>UPI ID</div>
                  <div className="font-mono font-bold text-sm truncate" style={{ color: 'hsl(270 100% 82%)' }}>
                    {UPI_ID}
                  </div>
                </div>
                <button onClick={copyUpiId}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                  style={{
                    background: copied ? 'hsl(145 60% 40% / 0.2)' : 'hsl(270 100% 60% / 0.15)',
                    border: `1px solid ${copied ? 'hsl(145 60% 50% / 0.4)' : 'hsl(270 100% 60% / 0.3)'}`,
                    color: copied ? 'hsl(145 70% 55%)' : 'hsl(270 100% 75%)',
                  }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Email notice */}
              <div className="w-full text-center text-xs rounded-lg py-2 px-4"
                style={{ background: 'hsl(200 60% 50% / 0.06)', border: '1px solid hsl(200 60% 50% / 0.2)', color: 'hsl(200 60% 65%)' }}>
                📧 Receipt will be sent to <span className="font-semibold">{customerEmail}</span>
              </div>

              {/* App buttons */}
              <div className="w-full">
                <p className="text-xs text-center mb-2" style={{ color: 'hsl(270 30% 50%)' }}>
                  Scan above <span style={{ color: 'hsl(270 30% 40%)' }}>or tap to open app directly</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'GPay',    color: '#4285F4', emoji: '🔵', scheme: `tez://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${product.price}&cu=INR&tn=${encodeURIComponent('Shadow Marketplace - ' + product.name)}` },
                    { name: 'PhonePe', color: '#6739B7', emoji: '🟣', scheme: `phonepe://pay?transactionId=SM${Date.now()}&amount=${product.price * 100}&pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}` },
                    { name: 'Paytm',   color: '#00BAF2', emoji: '🔷', scheme: `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${product.price}&cu=INR` },
                  ].map(app => (
                    <a key={app.name} href={app.scheme}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: `${app.color}18`, border: `1px solid ${app.color}44`, color: app.color }}>
                      <span className="text-lg">{app.emoji}</span>
                      {app.name}
                    </a>
                  ))}
                </div>
                <p className="text-xs text-center mt-2" style={{ color: 'hsl(270 20% 35%)' }}>
                  App buttons work on mobile · QR works everywhere
                </p>
              </div>

              <button onClick={() => setStep('txid')} className="btn-primary w-full py-3 rounded-xl text-base">
                I've Paid →
              </button>
            </div>
          )}

          {/* ── TxID step ─────────────────────────── */}
          {step === 'txid' && (
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <div className="text-3xl mb-2">🔐</div>
                <h3 className="font-bold text-base mb-1" style={{ color: 'hsl(270 100% 90%)' }}>Enter Transaction ID</h3>
                <p className="text-xs" style={{ color: 'hsl(270 30% 55%)' }}>Find the UPI reference in your payment app</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(270 60% 65%)' }}>
                  UPI Transaction ID
                </label>
                <input type="text" value={txId}
                  onChange={(e) => { setTxId(e.target.value); setTxError(''); }}
                  placeholder="e.g. 123456789012"
                  className="input-field w-full px-4 py-3 rounded-lg font-mono text-sm"
                  onKeyDown={(e) => { if (e.key === 'Enter') handlePaid(); }} autoFocus />
                {txError && <p className="text-xs" style={{ color: 'hsl(0 84% 65%)' }}>{txError}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('qr')} className="btn-secondary flex-1 py-3 rounded-xl text-sm">← Back</button>
                <button onClick={handlePaid} className="btn-primary flex-1 py-3 rounded-xl text-sm">Submit Order</button>
              </div>
            </div>
          )}

          {/* ── Done step ─────────────────────────── */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ background: 'hsl(145 60% 40% / 0.15)', border: '2px solid hsl(145 60% 50%)', boxShadow: '0 0 20px hsl(145 60% 40% / 0.3)' }}>
                ✓
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-2" style={{ color: 'hsl(145 70% 60%)' }}>Order Placed!</h3>
                <p className="text-sm" style={{ color: 'hsl(270 30% 60%)' }}>
                  Your order is <span className="badge-pending px-1.5 py-0.5 rounded text-xs font-bold">Pending</span> verification.
                  Account credentials will be sent to:
                </p>
                <p className="text-sm font-semibold mt-1" style={{ color: 'hsl(200 80% 70%)' }}>{customerEmail}</p>
              </div>
              <button onClick={onClose} className="btn-primary px-8 py-3 rounded-xl text-sm">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
