/* ──────────────────────────────────────────────────────────
   ProductCard.tsx — Marketplace product card with glow hover
   ────────────────────────────────────────────────────────── */
import type { Product } from '@/lib/storage';

interface Props {
  product: Product;
  onBuy: (product: Product) => void;
}

export default function ProductCard({ product, onBuy }: Props) {
  return (
    <article
      className="card-hover relative flex flex-col rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, hsl(240 18% 8%), hsl(240 12% 6%))',
        border: '1px solid hsl(270 40% 18%)',
      }}
    >
      {/* Badge */}
      {product.badge && (
        <span
          className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full z-10"
          style={{
            background: 'linear-gradient(135deg, hsl(270 100% 45%), hsl(270 100% 60%))',
            color: 'white',
            boxShadow: '0 0 8px hsl(270 100% 60% / 0.5)',
          }}
        >
          {product.badge}
        </span>
      )}

      {/* Card body */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Icon area */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-1"
          style={{
            background: 'hsl(270 100% 60% / 0.12)',
            border: '1px solid hsl(270 100% 60% / 0.25)',
          }}
        >
          ⛏️
        </div>

        {/* Name */}
        <h3
          className="font-bold text-lg leading-tight tracking-wide"
          style={{ color: 'hsl(270 100% 90%)' }}
        >
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(270 30% 60%)' }}>
            {product.description}
          </p>
        )}

        {/* Divider */}
        <div
          className="mt-auto pt-4 border-t"
          style={{ borderColor: 'hsl(270 40% 15%)' }}
        />

        {/* Footer: price + buy */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs" style={{ color: 'hsl(270 30% 50%)' }}>Price</span>
            <div
              className="text-2xl font-black tracking-tight glow-text"
              style={{ color: 'hsl(270 100% 70%)' }}
            >
              ₹{product.price}
            </div>
          </div>

          <button
            onClick={() => onBuy(product)}
            className="btn-primary px-5 py-2.5 rounded-lg text-sm"
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}
