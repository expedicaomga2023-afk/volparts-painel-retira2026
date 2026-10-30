import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import DeliveryPinModal from '@/components/DeliveryPinModal';
import NewOrderModal from '@/components/NewOrderModal';
import SearchBar from '@/components/SearchBar';
import StatusColumn from '@/components/StatusColumn';
import { ORDER_STATUSES } from '@/constants/orderStatuses';
import type { NewOrderInput } from '@/utils/orderForm';
import type { Order, OrderStatus } from '@/types/order';
import { buildOrderGroupInfo, matchesOrderSearch } from '@/utils/orderUtils';

interface PickupPanelProps {
  orders: Order[];
  locations: string[];
  pickupDeadlineDays: number;
  onMove: (orderId: string, target: OrderStatus) => void;
  onSendPin: (orderId: string) => void;
  onCreate: (input: NewOrderInput) => void;
  onCancel: (orderId: string) => void;
}

export default function PickupPanel({
  orders,
  locations,
  pickupDeadlineDays,
  onMove,
  onSendPin,
  onCreate,
  onCancel,
}: PickupPanelProps) {
  const [query, setQuery] = useState('');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [orderToDeliver, setOrderToDeliver] = useState<Order | null>(null);

  const boardOrders = useMemo(() => orders.filter((order) => order.status !== 'cancelado'), [orders]);

  const groupInfoById = useMemo(() => buildOrderGroupInfo(boardOrders), [boardOrders]);

  const visibleOrders = useMemo(
    () => boardOrders.filter((order) => matchesOrderSearch(order, query)),
    [boardOrders, query]
  );

  const handleCreate = (input: NewOrderInput) => {
    onCreate(input);
    setIsNewOrderOpen(false);
  };

  const handleConfirmCancel = () => {
    if (orderToCancel) onCancel(orderToCancel.id);
    setOrderToCancel(null);
  };

  const handleDelivered = () => {
    if (orderToDeliver) onMove(orderToDeliver.id, 'entregue');
    setOrderToDeliver(null);
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:min-h-0 lg:flex-1 lg:px-8 lg:py-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Painel de Retirada</h1>
        <button
          type="button"
          onClick={() => setIsNewOrderOpen(true)}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
        >
          <Plus className="h-4 w-4" />
          Novo Pedido
        </button>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        resultCount={visibleOrders.length}
        totalCount={boardOrders.length}
      />

      <div className="mt-4 grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)]">
        {ORDER_STATUSES.map((status) => (
          <StatusColumn
            key={status.value}
            status={status}
            orders={visibleOrders.filter((order) => order.status === status.value)}
            groupInfoById={groupInfoById}
            pickupDeadlineDays={pickupDeadlineDays}
            onMove={onMove}
            onRequestCancel={setOrderToCancel}
            onRequestDeliver={setOrderToDeliver}
            onSendPin={onSendPin}
          />
        ))}
      </div>

      {isNewOrderOpen && (
        <NewOrderModal
          existingOrderNumbers={orders.map((order) => order.orderNumber)}
          orders={orders}
          locations={locations}
          onClose={() => setIsNewOrderOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {orderToDeliver && (
        <DeliveryPinModal
          order={orderToDeliver}
          onClose={() => setOrderToDeliver(null)}
          onDelivered={handleDelivered}
        />
      )}

      {orderToCancel && (
        <ConfirmDialog
          title="Cancelar pedido?"
          message={`O pedido ${orderToCancel.orderNumber} de ${orderToCancel.customerName} será cancelado e movido para o Histórico.`}
          confirmLabel="Cancelar pedido"
          onConfirm={handleConfirmCancel}
          onCancel={() => setOrderToCancel(null)}
        />
      )}
    </main>
  );
}
