export type OrderStatus = 'pendente' | 'pronto' | 'entregue' | 'cancelado';

export interface OrderPart {
  address?: string;
  brand?: string;
  code: string;
  description: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  cpf: string;
  phone: string;
  location: string;
  parts: OrderPart[];
  status: OrderStatus;
  statusChangedAt: string;
  pickupPin?: string;
  pinSentAt?: string;
  /** Última alteração, usada para resolver conflitos entre dispositivos. */
  updatedAt?: string;
}
