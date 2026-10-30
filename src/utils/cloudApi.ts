import type { Order } from '@/types/order';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error(`Falha na sincronização (${response.status})`);
  return response.json() as Promise<T>;
}

export const fetchOrders = () => request<Order[]>('/api/orders');

export const pushOrders = (orders: Order[]) =>
  request<{ ok: true }>('/api/orders', { method: 'PUT', body: JSON.stringify(orders) });

export interface RemoteSettings {
  data: Record<string, unknown>;
  updatedAt: string;
}

export const fetchSettings = () => request<RemoteSettings | null>('/api/settings');

export const pushSettings = (settings: RemoteSettings) =>
  request<{ ok: true }>('/api/settings', { method: 'PUT', body: JSON.stringify(settings) });
