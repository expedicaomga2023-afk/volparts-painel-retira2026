import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/Modal';
import { getInputClass } from '@/constants/formStyles';
import type { Order } from '@/types/order';
import { isPickupPinMatch } from '@/utils/pickupPin';

const FORM_ID = 'delivery-pin-form';
const SUCCESS_DELAY_MS = 1200;
const PIN_LENGTH = 6;

type PinStatus = 'idle' | 'error' | 'success';

interface DeliveryPinModalProps {
  order: Order;
  onClose: () => void;
  onDelivered: () => void;
}

export default function DeliveryPinModal({ order, onClose, onDelivered }: DeliveryPinModalProps) {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<PinStatus>('idle');

  useEffect(() => {
    if (status !== 'success') return;
    const timer = window.setTimeout(onDelivered, SUCCESS_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [status, onDelivered]);

  const handlePinChange = (value: string) => {
    setPin(value.replace(/\D/g, '').slice(0, PIN_LENGTH));
    setStatus((current) => (current === 'error' ? 'idle' : current));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(isPickupPinMatch(pin, order.pickupPin) ? 'success' : 'error');
  };

  const isSuccess = status === 'success';

  return (
    <Modal
      title="Confirmar entrega"
      description={`Peça ao cliente o código PIN do pedido ${order.orderNumber}.`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={pin.length !== PIN_LENGTH || isSuccess}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirmar entrega
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
          <p className="font-semibold text-slate-900">{order.customerName}</p>
          <p className="text-slate-600">Pedido {order.orderNumber}</p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-800">Código PIN (6 dígitos)</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={pin}
            onChange={(event) => handlePinChange(event.target.value)}
            placeholder="000000"
            aria-invalid={status === 'error'}
            className={`${getInputClass(status === 'error')} text-center font-mono text-xl tracking-[0.4em]`}
          />
        </label>

        {status === 'error' && (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Código incorreto. Confira o PIN informado pelo cliente.
          </p>
        )}

        {isSuccess && (
          <p className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            PIN confirmado. Pedido marcado como entregue.
          </p>
        )}
      </form>
    </Modal>
  );
}
