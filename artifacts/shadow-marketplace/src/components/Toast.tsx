/* ──────────────────────────────────────────────────────────
   Toast.tsx — Notification toast
   ────────────────────────────────────────────────────────── */
export default function Toast({ message }: { message: string }) {
  return (
    <div
      className="animate-slide-down px-4 py-3 rounded-xl text-sm font-medium pointer-events-auto"
      style={{
        background: 'linear-gradient(135deg, hsl(240 20% 10%), hsl(240 15% 8%))',
        border: '1px solid hsl(270 60% 30%)',
        color: 'hsl(270 80% 85%)',
        boxShadow: '0 8px 24px hsl(240 20% 3% / 0.6), 0 0 0 1px hsl(270 100% 60% / 0.1)',
        maxWidth: '320px',
      }}
    >
      <span style={{ filter: 'drop-shadow(0 0 4px hsl(145 60% 50%))' }}>✓</span>{' '}
      {message}
    </div>
  );
}
