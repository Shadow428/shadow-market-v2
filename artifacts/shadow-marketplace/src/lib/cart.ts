/* ──────────────────────────────────────────────────────────
   cart.ts — Shopping cart backed by localStorage
   ────────────────────────────────────────────────────────── */
import type { Product } from './storage';

export interface CartItem {
  product: Product;
  addedAt: string;
}

const CART_KEY = 'sm_cart';

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function addToCart(product: Product): { added: boolean; alreadyIn: boolean } {
  const cart = getCart();
  const exists = cart.some(i => i.product.id === product.id);
  if (exists) return { added: false, alreadyIn: true };
  cart.push({ product, addedAt: new Date().toISOString() });
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return { added: true, alreadyIn: false };
}

export function removeFromCart(productId: string): void {
  const cart = getCart().filter(i => i.product.id !== productId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.product.price, 0);
}
