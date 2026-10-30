import { AlertTriangle } from 'lucide-react';
import { ORDER_STATUSES } from '@/constants/orderStatuses';
import type { Order } from '@/types/order';

interface MultipleOrdersAlertProps {
  otherOrders: Order[];
}

function getStatusLabel(status: Order['status']): string {
  return ORDER_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export default function MultipleOrdersAlert({ otherOrders }: MultipleOrdersAlertProps) {
  const count = otherOrders.length;
  const summary = otherOrders
    .map((order) => `${order.orderNumber} (${getStatusLabel(order.status)})`)
    .join(', ');
  const sharedLocations = [...new Set(otherOrders.map((order) => order.location).filter(Boolean))];

  return (
    <div className="group/alert relative self-start">
      <button
        type="button"
        className="flex h-6 items-center gap-1.5 rounded-md bg-amber-100 px-2 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-300 transition hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <AlertTriangle className="h-3 w-3" />
        +{count} {count === 1 ? 'pedido deste cliente' : 'pedidos deste cliente'}
      </button>
      <div className="pointer-events-none invisible absolute left-0 top-full z-20 mt-1.5 w-max max-w-[260px] rounded-lg bg-slate-900 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-lg transition group-hover/alert:visible group-hover/alert:opacity-100 group-focus-within/alert:visible group-focus-within/alert:opacity-100">
        Este cliente também tem os pedidos: {summary}
        {sharedLocations.length > 0 && (
          <span className="mt-1 block font-semibold text-amber-300">
            {sharedLocations.length === 1
              ? `Agrupados na prateleira ${sharedLocations[0]}.`
              : `Atenção: pedidos em prateleiras diferentes (${sharedLocations.join(', ')}). Unifique no mesmo local.`}
          </span>
        )}
      </div>
    </div>
  );
}
