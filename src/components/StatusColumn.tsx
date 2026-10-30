import OrderCard from '@/components/OrderCard';
import type { StatusConfig } from '@/constants/orderStatuses';
import type { Order, OrderStatus } from '@/types/order';
import type { OrderGroupInfo } from '@/utils/orderUtils';

interface StatusColumnProps {
  status: StatusConfig;
  orders: Order[];
  groupInfoById: Record<string, OrderGroupInfo>;
  pickupDeadlineDays: number;
  onMove: (orderId: string, target: OrderStatus) => void;
  onRequestCancel: (order: Order) => void;
  onRequestDeliver: (order: Order) => void;
  onSendPin: (orderId: string) => void;
}

export default function StatusColumn({
  status,
  orders,
  groupInfoById,
  pickupDeadlineDays,
  onMove,
  onRequestCancel,
  onRequestDeliver,
  onSendPin,
}: StatusColumnProps) {
  return (
    <section className="flex min-h-0 flex-col gap-3 rounded-2xl bg-slate-100/70 p-3">
      <header className="flex shrink-0 items-center gap-2.5 px-1">
        <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
        <h2 className="text-sm font-bold text-slate-900">
          {status.label}{' '}
          <span className="font-medium text-slate-500">({orders.length})</span>
        </h2>
      </header>

      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1 pb-1 pt-0.5 lg:pr-1.5">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
            <p className="text-sm text-slate-500">Nenhum pedido nesta etapa</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              pickupDeadlineDays={pickupDeadlineDays}
              onMove={onMove}
              onRequestCancel={onRequestCancel}
              onRequestDeliver={onRequestDeliver}
              onSendPin={onSendPin}
              groupInfo={groupInfoById[order.id]}
            />
          ))
        )}
      </div>
    </section>
  );
}
