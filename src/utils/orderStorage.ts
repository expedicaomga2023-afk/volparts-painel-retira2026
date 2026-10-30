import type { Order } from '@/types/order';

const ORDERS_KEY = 'volparts:pedidos';
const PENDING_KEY = 'volparts:pedidos-pendentes';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode or full quota); data still lives in memory and in the cloud.
  }
}

export function loadCachedOrders(): Order[] {
  const parsed = readJson<unknown>(ORDERS_KEY, []);
  return Array.isArray(parsed) ? (parsed as Order[]) : [];
}

export function saveCachedOrders(orders: Order[]): void {
  writeJson(ORDERS_KEY, orders);
}

/** IDs of orders changed locally that the cloud has not confirmed yet. */
export function loadPendingIds(): Set<string> {
  const parsed = readJson<unknown>(PENDING_KEY, []);
  return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []);
}

export function savePendingIds(ids: Set<string>): void {
  writeJson(PENDING_KEY, [...ids]);
}
