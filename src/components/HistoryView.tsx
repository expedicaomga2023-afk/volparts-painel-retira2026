import { useMemo, useState } from 'react';
import { CheckCircle2, Inbox, MapPin, Package, XCircle } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import type { Order, OrderStatus } from '@/types/order';
import { formatOrderDate, matchesOrderSearch } from '@/utils/orderUtils';

interface HistoryViewProps {
  orders: Order[];
}

type HistoryFilter = 'todos' | Extract<OrderStatus, 'entregue' | 'cancelado'>;

const FILTERS: { value: HistoryFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'entregue', label: 'Entregues' },
  { value: 'cancelado', label: 'Cancelados' },
];

const STATUS_STYLES = {
  entregue: {
    label: 'Entregue',
    dateLabel: 'Entregue em',
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    Icon: CheckCircle2,
  },
  cancelado: {
    label: 'Cancelado',
    dateLabel: 'Cancelado em',
    badge: 'bg-slate-200 text-slate-700 ring-slate-300',
    Icon: XCircle,
  },
} as const;

export default function HistoryView({ orders }: HistoryViewProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>('todos');

  const finishedOrders = useMemo(
    () =>
      orders
        .filter((order): order is Order & { status: 'entregue' | 'cancelado' } =>
          order.status === 'entregue' || order.status === 'cancelado'
        )
        .sort((a, b) => b.statusChangedAt.localeCompare(a.statusChangedAt)),
    [orders]
  );

  const visibleOrders = useMemo(
    () =>
      finishedOrders.filter(
        (order) =>
          (filter === 'todos' || order.status === filter) && matchesOrderSearch(order, query)
      ),
    [finishedOrders, filter, query]
  );

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Histórico de Pedidos</h1>
        <p className="text-sm text-slate-600">Consulte os pedidos entregues e cancelados.</p>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        resultCount={visibleOrders.length}
        totalCount={finishedOrders.length}
      />

      <div className="flex gap-2" role="group" aria-label="Filtrar por situação">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            aria-pressed={filter === item.value}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 transition ${
              filter === item.value
                ? 'bg-blue-700 text-white ring-blue-700'
                : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
          <Inbox className="h-10 w-10 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">Nenhum pedido encontrado no histórico.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visibleOrders.map((order) => {
            const style = STATUS_STYLES[order.status];
            const totalPieces = order.parts.reduce((sum, part) => sum + part.quantity, 0);
            return (
              <li
                key={order.id}
                className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-slate-900">{order.orderNumber}</h2>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${style.badge}`}
                    >
                      <style.Icon className="h-3.5 w-3.5" />
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800">{order.customerName}</p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {order.location}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm sm:text-right">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Package className="h-4 w-4 text-slate-400" />
                    {totalPieces} {totalPieces === 1 ? 'peça' : 'peças'}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{style.dateLabel}</p>
                    <p className="font-semibold text-slate-800">{formatOrderDate(order.statusChangedAt)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
