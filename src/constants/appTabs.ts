export const APP_TABS = [
  { value: 'painel', label: 'Painel de Retirada' },
  { value: 'historico', label: 'Histórico' },
  { value: 'configuracoes', label: 'Configurações' },
] as const;

export type AppTab = (typeof APP_TABS)[number]['value'];
