import type { AppSettings } from '@/types/settings';

export const PICKUP_DEADLINE_MIN_DAYS = 1;
export const PICKUP_DEADLINE_MAX_DAYS = 365;

export const WHATSAPP_TAGS = ['{nome_cliente}', '{numero_pedido}', '{codigo_pin}'] as const;

export const DEFAULT_WHATSAPP_TEMPLATE =
  'Olá, {nome_cliente}! Seu pedido {numero_pedido} da VOLPARTS já está pronto para retirada. Seu código PIN de retirada é {codigo_pin}. Apresente este código ao atendente para receber o pedido. Obrigado!';

export const DEFAULT_SETTINGS: AppSettings = {
  locations: [
    'Corredor A',
    'Corredor B',
    'Corredor C',
    'Corredor D',
    'Corredor E',
    'Corredor F',
    'Prateleira 1',
    'Prateleira 2',
    'Prateleira 3',
    'Prateleira 4',
    'Prateleira 5',
    'Prateleira 6',
    'Prateleira 7',
  ],
  whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE,
  pickupDeadlineDays: 3,
};
