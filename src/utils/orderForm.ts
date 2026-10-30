import type { Order, OrderPart } from '@/types/order';
import { isValidCpfDigits } from '@/utils/orderUtils';

export interface PartDraft {
  address: string;
  brand: string;
  code: string;
  description: string;
  quantity: string;
}

export interface OrderDraft {
  orderNumber: string;
  customerName: string;
  phone: string;
  cpf: string;
  location: string;
  parts: PartDraft[];
}

export interface PartDraftErrors {
  code?: string;
  description?: string;
  quantity?: string;
}

export interface OrderDraftErrors {
  orderNumber?: string;
  customerName?: string;
  phone?: string;
  cpf?: string;
  location?: string;
  parts?: string;
  partRows: PartDraftErrors[];
}

export type NewOrderInput = Omit<Order, 'id' | 'status' | 'statusChangedAt'>;

export const EMPTY_PART: PartDraft = { address: '', brand: '', code: '', description: '', quantity: '1' };

export const EMPTY_ORDER_DRAFT: OrderDraft = {
  orderNumber: '',
  customerName: '',
  phone: '',
  cpf: '',
  location: '',
  parts: [{ ...EMPTY_PART }],
};

interface ValidationContext {
  existingOrderNumbers: string[];
  locations: string[];
}

export function validateOrderDraft(draft: OrderDraft, context: ValidationContext): OrderDraftErrors {
  const errors: OrderDraftErrors = { partRows: [] };

  const orderNumber = draft.orderNumber.trim();
  if (!orderNumber) {
    errors.orderNumber = 'Informe o número do pedido.';
  } else if (context.existingOrderNumbers.some((number) => number.toLowerCase() === orderNumber.toLowerCase())) {
    errors.orderNumber = 'Já existe um pedido com este número.';
  }

  if (!draft.customerName.trim()) {
    errors.customerName = 'Informe o nome do cliente.';
  }

  const phoneDigits = draft.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.phone = 'Informe um telefone com DDD (10 ou 11 dígitos).';
  }

  if (draft.cpf.trim() && !isValidCpfDigits(draft.cpf)) {
    errors.cpf = 'O CPF deve ter 11 dígitos.';
  }

  if (!draft.location || !context.locations.includes(draft.location)) {
    errors.location = 'Escolha a localização no estoque.';
  }

  if (draft.parts.length === 0) {
    errors.parts = 'Adicione pelo menos uma peça.';
  }

  errors.partRows = draft.parts.map((part) => {
    const rowErrors: PartDraftErrors = {};
    if (!part.code.trim()) rowErrors.code = 'Código obrigatório.';
    if (!part.description.trim()) rowErrors.description = 'Descrição obrigatória.';
    const quantity = Number(part.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) rowErrors.quantity = 'Mín. 1';
    return rowErrors;
  });

  return errors;
}

export function hasOrderDraftErrors(errors: OrderDraftErrors): boolean {
  const { partRows, ...fieldErrors } = errors;
  return (
    Object.values(fieldErrors).some(Boolean) ||
    partRows.some((row) => Object.values(row).some(Boolean))
  );
}

export function buildNewOrderInput(draft: OrderDraft): NewOrderInput {
  const parts: OrderPart[] = draft.parts.map((part) => ({
    address: part.address.trim(),
    brand: part.brand.trim(),
    code: part.code.trim(),
    description: part.description.trim(),
    quantity: Number(part.quantity),
  }));

  return {
    orderNumber: draft.orderNumber.trim(),
    customerName: draft.customerName.trim(),
    phone: draft.phone.trim(),
    cpf: draft.cpf.trim(),
    location: draft.location,
    parts,
  };
}
