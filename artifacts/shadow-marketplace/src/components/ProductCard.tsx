/* ──────────────────────────────────────────────────────────
   ProductCard.tsx — Product card with Buy Now + Add to Cart
   ────────────────────────────────────────────────────────── */
import { useState } from 'react';
import type { Product } from '@/lib/storage';

interface Props {
  product: Product;
  onBuy: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  inCart: boolean;
}

export default function ProductCard({ product, onBuy, onAddToCart, inCart }: Props) {
  const [cartAnim, setCartAnim] = useState(false);

  function handleAddToCart() {
    if (inCart) return;
    onAddToCart(product);
    setCartAnim(true);
    setTimeout(() => setCartAnim(false), 600);
  }

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
        {/* Icon */}
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
        <h3 className="font-bold text-lg leading-tight tracking-wide" style={{ color: 'hsl(270 100% 90%)' }}>
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(270 30% 60%)' }}>
            {product.description}
          </p>
        )}

        {/* Divider */}
        <div className="mt-auto pt-4 border-t" style={{ borderColor: 'hsl(270 40% 15%)' }} />

        {/* Price */}
        <div>
          <span className="text-xs" style={{ color: 'hsl(270 30% 50%)' }}>Price</span>
          <div className="text-2xl font-black tracking-tight glow-text" style={{ color: 'hsl(270 100% 70%)' }}>
            ₹{product.price}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
            style={
              inCart
                ? {
                    background: 'hsl(145 60% 40% / 0.15)',
                    border: '1px solid hsl(145 60% 40% / 0.5)',
                    color: 'hsl(145 70% 55%)',
                    cursor: 'default',
                  }
                : {
                    background: cartAnim ? 'hsl(270 100% 60% / 0.2)' : 'transparent',
                    border: '1px solid hsl(270 60% 35%)',
                    color: 'hsl(270 80% 75%)',
                  }
            }
          >
            {inCart ? (
              <>✓ In Cart</>
            ) : (
              <>{cartAnim ? '✓' : '🛒'} Add to Cart</>
            )}
          </button>

          {/* Buy Now */}
          <button
            onClick={() => onBuy(product)}
            className="btn-primary px-4 py-2.5 rounded-lg text-sm"
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}
