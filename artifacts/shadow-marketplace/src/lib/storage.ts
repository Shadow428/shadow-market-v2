/* ──────────────────────────────────────────────────────────
   storage.ts  — LocalStorage helpers for Shadow Marketplace
   ────────────────────────────────────────────────────────── */

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  badge?: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  transactionId: string;
  status: 'Pending' | 'Verified';
  createdAt: string;
}

const PRODUCTS_KEY = 'sm_products';
const ORDERS_KEY   = 'sm_orders';
const ADMIN_KEY    = 'sm_admin_pass';

/* ── Default seed products ──────────────────────────────── */
const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Shadow Starter',   price: 149,  description: 'Full access Java account. Clean history, never banned.', badge: 'Popular' },
  { id: 'p2', name: 'Phantom Premium',  price: 299,  description: 'Java + Bedrock linked. Fresh migration, no login history.', badge: 'Best Value' },
  { id: 'p3', name: 'Void Elite',       price: 499,  description: 'OG premium account. Cape included, high KD stats.', badge: 'Rare' },
  { id: 'p4', name: 'Specter Bundle',   price: 699,  description: 'Two separate Java accounts bundled at a discount.', badge: 'Bundle' },
  { id: 'p5', name: 'Ghost Rank',       price: 199,  description: 'Fresh account with a clean username, ideal for SMP.', badge: '' },
  { id: 'p6', name: 'Obsidian Ultra',   price: 999,  description: 'Fully unbanned legacy account. Pre-Bedrock era origin.', badge: 'Limited' },
];

/* ── Products ────────────────────────────────────────────── */
export function getProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    return JSON.parse(raw) as Product[];
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, 'id'>): Product {
  const products = getProducts();
  const newProduct: Product = { ...product, id: `p_${Date.now()}` };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

/* ── Orders ─────────────────────────────────────────────── */
export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function addOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: `ord_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  return newOrder;
}

export function markOrderVerified(id: string): void {
  const orders = getOrders().map(o =>
    o.id === id ? { ...o, status: 'Verified' as const } : o
  );
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

/* ── Admin ──────────────────────────────────────────────── */
const DEFAULT_ADMIN_PASS = 'shadow123';

export function getAdminPassword(): string {
  return localStorage.getItem(ADMIN_KEY) ?? DEFAULT_ADMIN_PASS;
}

export function checkAdminPassword(pass: string): boolean {
  return pass === getAdminPassword();
}
