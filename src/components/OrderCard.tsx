import { ChevronDown, Clock, Tag, Trash2 } from 'lucide-react';
import MultipleOrdersAlert from '@/components/MultipleOrdersAlert';
import PickupCodePanel from '@/components/PickupCodePanel';
import { ORDER_STATUS_ACTIONS } from '@/constants/orderStatuses';
import type { Order, OrderStatus } from '@/types/order';
import { getDaysInStatus, isOrderOverdue, type OrderGroupInfo } from '@/utils/orderUtils';

interface OrderCardProps {
  order: Order;
  pickupDeadlineDays: number;
  onMove: (orderId: string, target: OrderStatus) => void;
  onRequestCancel: (order: Order) => void;
  onRequestDeliver: (order: Order) => void;
  onSendPin: (orderId: string) => void;
  groupInfo: OrderGroupInfo;
}

const BUTTON_BASE =
  'flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition active:scale-[0.98] focus:outline-none focus-visible:ring-4';

export default function OrderCard({
  order,
  pickupDeadlineDays,
  onMove,
  onRequestCancel,
  onRequestDeliver,
  onSendPin,
  groupInfo,
}: OrderCardProps) {
  const actions = ORDER_STATUS_ACTIONS[order.status];
  const totalPieces = order.parts.reduce((sum, part) => sum + part.quantity, 0);
  const overdue = isOrderOverdue(order, pickupDeadlineDays);
  const daysInStatus = getDaysInStatus(order);
  const showDays = order.status !== 'entregue';

  return (
    <article
      className={`group/card flex shrink-0 flex-col gap-2 rounded-xl bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_-6px_rgba(15,23,42,0.12)] ${
        groupInfo.hasMultipleOrders ? 'ring-1 ring-amber-400' : ''
      }`}
    >
      {groupInfo.hasMultipleOrders && <MultipleOrdersAlert otherOrders={groupInfo.otherActiveOrders} />}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold leading-none text-slate-900">{order.orderNumber}</h3>
        <div className="flex items-center gap-1">
          {showDays && (
            <span
              aria-label={`Aguardando há ${daysInStatus} ${daysInStatus === 1 ? 'dia' : 'dias'}`}
              className={`flex h-5 items-center gap-1 rounded px-1.5 text-[11px] font-semibold ${
                overdue ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Clock className="h-2.5 w-2.5" />
              {daysInStatus === 0 ? 'Hoje' : `${daysInStatus}d`}
            </span>
          )}
          <button
            type="button"
            onClick={() => onRequestCancel(order)}
            aria-label="Cancelar pedido"
            title="Cancelar pedido"
            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 md:opacity-0 md:group-hover/card:opacity-100 md:focus-visible:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <details className="group/parts">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm text-slate-600 transition hover:text-blue-800">
          <span className="min-w-0 truncate">
            <span className="font-medium text-slate-800">{order.customerName}</span>
            <span className="text-slate-400"> • </span>
            {totalPieces} {totalPieces === 1 ? 'peça' : 'peças'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-open/parts:rotate-180" />
        </summary>
        <ul className="mt-1 divide-y divide-slate-100">
          {order.parts.map((part) => (
            <li key={`${part.code}-${part.description}`} className="flex items-center justify-between gap-3 py-1.5 text-xs">
              <div className="min-w-0">
                <p className="truncate text-slate-800">{part.description}</p>
                <p className="font-mono text-[11px] text-slate-500">Cód. {part.code}</p>
              </div>
              <span className="shrink-0 font-bold text-slate-700">x{part.quantity}</span>
            </li>
          ))}
        </ul>
      </details>

      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <Tag className="h-3 w-3 shrink-0 text-slate-400" />
        <span className="truncate">{order.location}</span>
      </p>

      {order.status === 'pronto' && order.pickupPin && (
        <PickupCodePanel
          pin={order.pickupPin}
          sentAt={order.pinSentAt}
          onSend={() => onSendPin(order.id)}
        />
      )}

      <div className="mt-1 grid grid-cols-2 gap-1.5">
        {actions.map((action) => {
          const Icon = action.icon;
          const isPrimary = action.variant === 'primary';
          return (
            <button
              key={action.label}
              type="button"
              onClick={() =>
                action.target === 'entregue'
                  ? onRequestDeliver(order)
                  : onMove(order.id, action.target)
              }
              className={`${BUTTON_BASE} ${actions.length === 1 ? 'col-span-2' : ''} ${
                isPrimary
                  ? 'bg-blue-700 text-white shadow-sm hover:bg-blue-800 focus-visible:ring-blue-200'
                  : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {action.label}
            </button>
          );
        })}
      </div>
    </article>
  );
}
