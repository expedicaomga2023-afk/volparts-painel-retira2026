import { PackageCheck, PackageOpen, Truck, Undo2, type LucideIcon } from 'lucide-react';
import type { OrderStatus } from '@/types/order';

export interface StatusConfig {
  value: OrderStatus;
  label: string;
  dotClass: string;
}

export const ORDER_STATUSES: StatusConfig[] = [
  { value: 'pendente', label: 'Pendente', dotClass: 'bg-amber-500' },
  { value: 'pronto', label: 'Pronto para Retirada', dotClass: 'bg-sky-500' },
  { value: 'entregue', label: 'Entregue', dotClass: 'bg-emerald-500' },
];

export interface StatusAction {
  label: string;
  target: OrderStatus;
  icon: LucideIcon;
  variant: 'primary' | 'secondary';
}

export const ORDER_STATUS_ACTIONS: Record<OrderStatus, StatusAction[]> = {
  pendente: [{ label: 'Marcar como Separado', target: 'pronto', icon: PackageCheck, variant: 'primary' }],
  pronto: [
    { label: 'Voltar', target: 'pendente', icon: Undo2, variant: 'secondary' },
    { label: 'Entregar', target: 'entregue', icon: Truck, variant: 'primary' },
  ],
  entregue: [{ label: 'Reabrir', target: 'pronto', icon: PackageOpen, variant: 'secondary' }],
  cancelado: [],
};
