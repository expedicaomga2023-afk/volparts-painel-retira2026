import type { Order } from '@/types/order';

export function matchesOrderSearch(
  order: { orderNumber: string; customerName: string },
  query: string
): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  return (
    order.orderNumber.toLowerCase().includes(term) ||
    order.customerName.toLowerCase().includes(term)
  );
}

export interface OrderGroupInfo {
  hasMultipleOrders: boolean;
  otherActiveOrders: Order[];
}

function isActiveOrder(order: Pick<Order, 'status'>): boolean {
  return order.status === 'pendente' || order.status === 'pronto';
}

function getCustomerKey(order: Pick<Order, 'phone' | 'customerName'>): string {
  return order.phone.replace(/\D/g, '') || order.customerName.trim().toLowerCase();
}

export function buildOrderGroupInfo(orders: Order[]): Record<string, OrderGroupInfo> {
  const activeByCustomer = new Map<string, Order[]>();
  for (const order of orders) {
    if (!isActiveOrder(order)) continue;
    const key = getCustomerKey(order);
    activeByCustomer.set(key, [...(activeByCustomer.get(key) ?? []), order]);
  }

  const result: Record<string, OrderGroupInfo> = {};
  for (const order of orders) {
    const group = isActiveOrder(order) ? (activeByCustomer.get(getCustomerKey(order)) ?? []) : [];
    const otherActiveOrders = group.filter((item) => item.id !== order.id);
    result[order.id] = { hasMultipleOrders: otherActiveOrders.length > 0, otherActiveOrders };
  }
  return result;
}

export function findExistingClientLocation(orders: Order[], clientName: string): string | null {
  const name = clientName.trim().toLowerCase();
  if (!name) return null;
  const match = orders.find(
    (order) => isActiveOrder(order) && order.customerName.trim().toLowerCase() === name && order.location
  );
  return match?.location ?? null;
}

const DAY_MS = 86_400_000;

export function getDaysInStatus(order: Pick<Order, 'statusChangedAt'>, now = Date.now()): number {
  return Math.floor((now - new Date(order.statusChangedAt).getTime()) / DAY_MS);
}

export function isOrderOverdue(order: Order, deadlineDays: number): boolean {
  const isWaiting = order.status === 'pendente' || order.status === 'pronto';
  return isWaiting && getDaysInStatus(order) > deadlineDays;
}

export function isValidCpfDigits(cpf: string): boolean {
  return cpf.replace(/\D/g, '').length === 11;
}

export function formatOrderDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR');
}
