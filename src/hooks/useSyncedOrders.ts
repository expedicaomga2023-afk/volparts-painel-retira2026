import { useCallback, useRef, useState } from 'react';
import { useSyncTriggers } from '@/hooks/useSyncTriggers';
import type { Order } from '@/types/order';
import { fetchOrders, pushOrders } from '@/utils/cloudApi';
import {
  loadCachedOrders,
  loadPendingIds,
  saveCachedOrders,
  savePendingIds,
} from '@/utils/orderStorage';

export type SyncStatus = 'sincronizando' | 'sincronizado' | 'offline';

const isNewerOrSame = (local: Order, remote: Order) =>
  (local.updatedAt ?? '') >= (remote.updatedAt ?? '');

/**
 * Orders backed by the cloud database, cached in LocalStorage so a reload or lost connection never
 * loses data. Local edits are queued and pushed on the next sync; the newest edit of each order wins.
 */
export function useSyncedOrders() {
  const [orders, setOrders] = useState<Order[]>(loadCachedOrders);
  const [status, setStatus] = useState<SyncStatus>('sincronizando');
  const [pendingCount, setPendingCount] = useState(() => loadPendingIds().size);

  const ordersRef = useRef(orders);
  const pendingRef = useRef(loadPendingIds());
  const runningRef = useRef(false);
  const queuedRef = useRef(false);

  const applyOrders = useCallback((next: Order[]) => {
    ordersRef.current = next;
    setOrders(next);
    saveCachedOrders(next);
  }, []);

  const applyPending = useCallback((ids: Set<string>) => {
    pendingRef.current = ids;
    savePendingIds(ids);
    setPendingCount(ids.size);
  }, []);

  const syncOnce = useCallback(async () => {
    if (pendingRef.current.size > 0) {
      const sent = ordersRef.current.filter((order) => pendingRef.current.has(order.id));
      await pushOrders(sent);

      // Keep orders edited again while the request was in flight queued for the next round.
      const sentVersions = new Map(sent.map((order) => [order.id, order.updatedAt]));
      const stillPending = new Set(
        [...pendingRef.current].filter((id) => {
          const current = ordersRef.current.find((order) => order.id === id);
          return current !== undefined && sentVersions.get(id) !== current.updatedAt;
        })
      );
      applyPending(stillPending);
    }

    const remote = await fetchOrders();
    const remoteById = new Map(remote.map((order) => [order.id, order]));
    const pending = new Set(pendingRef.current);
    const localOnly: Order[] = [];

    for (const local of ordersRef.current) {
      if (!pending.has(local.id)) continue;
      const remoteOrder = remoteById.get(local.id);
      if (!remoteOrder) localOnly.push(local);
      else if (isNewerOrSame(local, remoteOrder)) remoteById.set(local.id, local);
      else pending.delete(local.id); // Another device saved a newer version.
    }

    applyPending(pending);
    applyOrders([...localOnly, ...remote.map((order) => remoteById.get(order.id) ?? order)]);
  }, [applyOrders, applyPending]);

  const sync = useCallback(() => {
    if (runningRef.current) {
      queuedRef.current = true;
      return;
    }
    runningRef.current = true;

    syncOnce()
      .then(() => setStatus('sincronizado'))
      .catch(() => setStatus('offline'))
      .finally(() => {
        runningRef.current = false;
        if (queuedRef.current) {
          queuedRef.current = false;
          sync();
        }
      });
  }, [syncOnce]);

  useSyncTriggers(sync);

  const commit = useCallback(
    (changed: Order[]) => {
      if (changed.length === 0) return;
      const updatedAt = new Date().toISOString();
      const byId = new Map(changed.map((order) => [order.id, { ...order, updatedAt }]));

      const existing = ordersRef.current.map((order) => {
        const next = byId.get(order.id);
        byId.delete(order.id);
        return next ?? order;
      });
      applyOrders([...byId.values(), ...existing]);
      applyPending(new Set([...pendingRef.current, ...changed.map((order) => order.id)]));
      sync();
    },
    [applyOrders, applyPending, sync]
  );

  const addOrder = useCallback((order: Order) => commit([order]), [commit]);

  const updateOrder = useCallback(
    (orderId: string, update: (order: Order) => Order) => {
      const order = ordersRef.current.find((item) => item.id === orderId);
      if (order) commit([update(order)]);
    },
    [commit]
  );

  return { orders, addOrder, updateOrder, syncStatus: status, pendingCount };
}
