import { useEffect, useState, type FormEvent } from 'react';
import Modal from '@/components/Modal';
import OrderPartsFields from '@/components/OrderPartsFields';
import OrderScanner from '@/components/OrderScanner';
import { getInputClass } from '@/constants/formStyles';
import {
  EMPTY_ORDER_DRAFT,
  EMPTY_PART,
  buildNewOrderInput,
  hasOrderDraftErrors,
  validateOrderDraft,
  type NewOrderInput,
  type OrderDraft,
  type OrderDraftErrors,
} from '@/utils/orderForm';
import { sortLocations } from '@/utils/locationUtils';
import type { ExtractedOrder } from '@/utils/orderOcr';
import { findExistingClientLocation } from '@/utils/orderUtils';
import type { Order } from '@/types/order';

interface NewOrderModalProps {
  existingOrderNumbers: string[];
  orders: Order[];
  locations: string[];
  onClose: () => void;
  onSubmit: (input: NewOrderInput) => void;
}

const FORM_ID = 'new-order-form';

export default function NewOrderModal({
  existingOrderNumbers,
  orders,
  locations,
  onClose,
  onSubmit,
}: NewOrderModalProps) {
  const [draft, setDraft] = useState<OrderDraft>(EMPTY_ORDER_DRAFT);
  const [errors, setErrors] = useState<OrderDraftErrors | null>(null);

  const [isLocationLocked, setIsLocationLocked] = useState(false);

  useEffect(() => {
    const existingLocation = findExistingClientLocation(orders, draft.customerName);
    if (existingLocation) {
      setDraft((current) => ({ ...current, location: existingLocation }));
      setIsLocationLocked(true);
    } else {
      setIsLocationLocked((wasLocked) => {
        if (wasLocked) setDraft((current) => ({ ...current, location: '' }));
        return false;
      });
    }
  }, [orders, draft.customerName]);

  const sortedLocations = sortLocations(
    draft.location && !locations.includes(draft.location) ? [...locations, draft.location] : locations
  );

  const updateField = <K extends 'orderNumber' | 'customerName' | 'phone' | 'cpf' | 'location'>(
    field: K,
    value: OrderDraft[K]
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updatePart = (index: number, patch: Partial<OrderDraft['parts'][number]>) => {
    setDraft((current) => ({
      ...current,
      parts: current.parts.map((part, i) => (i === index ? { ...part, ...patch } : part)),
    }));
  };

  const addPart = () => {
    setDraft((current) => ({ ...current, parts: [...current.parts, { ...EMPTY_PART }] }));
  };

  const removePart = (index: number) => {
    setDraft((current) => ({
      ...current,
      parts: current.parts.filter((_, i) => i !== index),
    }));
  };

  const applyExtractedOrder = (extracted: ExtractedOrder) => {
    setDraft((current) => ({
      ...current,
      orderNumber: extracted.orderNumber || current.orderNumber,
      customerName: extracted.customerName || current.customerName,
      phone: extracted.phone || current.phone,
      parts:
        extracted.parts.length > 0
          ? extracted.parts.map((part) => ({
              address: part.address,
              brand: part.brand,
              code: part.code,
              description: part.description,
              quantity: String(part.quantity),
            }))
          : current.parts,
    }));
    setErrors(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateOrderDraft(draft, {
      existingOrderNumbers,
      locations: isLocationLocked ? [...locations, draft.location] : locations,
    });
    setErrors(nextErrors);
    if (hasOrderDraftErrors(nextErrors)) return;
    onSubmit(buildNewOrderInput(draft));
  };

  return (
    <Modal
      title="Novo Pedido"
      description="Cadastre manualmente um pedido. Ele entra na coluna Pendente."
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
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
          >
            Cadastrar pedido
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="space-y-5">
        <OrderScanner onExtract={applyExtractedOrder} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">Número do pedido</span>
            <input
              type="text"
              value={draft.orderNumber}
              onChange={(event) => updateField('orderNumber', event.target.value)}
              placeholder="Ex: PV-24820"
              className={getInputClass(Boolean(errors?.orderNumber))}
            />
            {errors?.orderNumber && <p className="text-xs text-red-600">{errors.orderNumber}</p>}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">Localização no estoque</span>
            <select
              value={draft.location}
              onChange={(event) => updateField('location', event.target.value)}
              disabled={isLocationLocked}
              className={`${getInputClass(Boolean(errors?.location))} disabled:cursor-not-allowed disabled:bg-amber-50`}
            >
              <option value="">Selecione...</option>
              {sortedLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            {isLocationLocked && (
              <p className="text-xs font-medium text-amber-600">
                ⚠️ Este cliente já possui um pedido ativo na prateleira {draft.location}. Este novo pedido foi
                agrupado no mesmo local automaticamente.
              </p>
            )}
            {errors?.location && <p className="text-xs text-red-600">{errors.location}</p>}
            {locations.length === 0 && (
              <p className="text-xs text-slate-500">Cadastre localizações na aba Configurações.</p>
            )}
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-800">Nome do cliente</span>
          <input
            type="text"
            value={draft.customerName}
            onChange={(event) => updateField('customerName', event.target.value)}
            placeholder="Nome completo"
            className={getInputClass(Boolean(errors?.customerName))}
          />
          {errors?.customerName && <p className="text-xs text-red-600">{errors.customerName}</p>}
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">Telefone</span>
            <input
              type="tel"
              value={draft.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="(11) 98765-4321"
              className={getInputClass(Boolean(errors?.phone))}
            />
            {errors?.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">
              CPF <span className="font-normal text-slate-500">(opcional)</span>
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={draft.cpf}
              onChange={(event) => updateField('cpf', event.target.value)}
              placeholder="000.000.000-00"
              className={getInputClass(Boolean(errors?.cpf))}
            />
            {errors?.cpf && <p className="text-xs text-red-600">{errors.cpf}</p>}
          </label>
        </div>

        <OrderPartsFields
          parts={draft.parts}
          rowErrors={errors?.partRows ?? []}
          partsError={errors?.parts}
          onChange={updatePart}
          onAdd={addPart}
          onRemove={removePart}
        />
      </form>
    </Modal>
  );
}
