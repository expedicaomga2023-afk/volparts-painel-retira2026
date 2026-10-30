import { useState } from 'react';
import AppHeader from '@/components/AppHeader';
import HistoryView from '@/components/HistoryView';
import PickupPanel from '@/components/PickupPanel';
import SettingsView from '@/components/settings/SettingsView';
import type { AppTab } from '@/constants/appTabs';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useSyncedOrders } from '@/hooks/useSyncedOrders';
import type { Order, OrderStatus } from '@/types/order';
import type { NewOrderInput } from '@/utils/orderForm';
import { generatePickupPin } from '@/utils/pickupPin';
import { buildWhatsappLink, renderWhatsappMessage } from '@/utils/whatsappMessage';

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('painel');
  const { orders, addOrder, updateOrder, syncStatus, pendingCount } = useSyncedOrders();
  const { settings, updateSettings } = useAppSettings();

  const moveOrder = (orderId: string, target: OrderStatus) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || order.status === target) return;

    updateOrder(orderId, (item) => ({
      ...item,
      status: target,
      statusChangedAt: new Date().toISOString(),
      pickupPin: target === 'pronto' ? (item.pickupPin ?? generatePickupPin()) : item.pickupPin,
    }));
  };

  const sendPickupPin = (orderId: string) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order?.pickupPin) return;

    const message = renderWhatsappMessage(settings.whatsappTemplate, {
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      pickupPin: order.pickupPin,
    });
    window.open(buildWhatsappLink(order.phone, message), '_blank', 'noopener,noreferrer');

    updateOrder(orderId, (item) => ({ ...item, pinSentAt: new Date().toISOString() }));
  };

  const createOrder = (input: NewOrderInput) => {
    const newOrder: Order = {
      ...input,
      id: `ord-${crypto.randomUUID()}`,
      status: 'pendente',
      statusChangedAt: new Date().toISOString(),
    };
    addOrder(newOrder);
  };

  const cancelOrder = (orderId: string) => {
    updateOrder(orderId, (item) => ({
      ...item,
      status: 'cancelado',
      statusChangedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className={`flex min-h-screen flex-col bg-slate-100 text-slate-900 ${activeTab === 'painel' ? 'lg:h-screen lg:overflow-hidden' : ''}`}>
      <AppHeader
        activeTab={activeTab}
        onChange={setActiveTab}
        syncStatus={syncStatus}
        pendingCount={pendingCount}
      />

      {activeTab === 'painel' && (
        <PickupPanel
          orders={orders}
          locations={settings.locations}
          pickupDeadlineDays={settings.pickupDeadlineDays}
          onMove={moveOrder}
          onSendPin={sendPickupPin}
          onCreate={createOrder}
          onCancel={cancelOrder}
        />
      )}
      {activeTab === 'historico' && <HistoryView orders={orders} />}
      {activeTab === 'configuracoes' && (
        <SettingsView settings={settings} onChange={updateSettings} />
      )}
    </div>
  );
}

export default App;
