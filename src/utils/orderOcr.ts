export interface ExtractedPart {
  address: string;
  code: string;
  brand: string;
  description: string;
  quantity: number;
}

export interface ExtractedOrder {
  orderNumber: string;
  customerName: string;
  phone: string;
  parts: ExtractedPart[];
}

const SCAN_DURATION_MS = 2000;

const SEPARATION_MAP_SAMPLE: ExtractedOrder = {
  orderNumber: '2066086',
  customerName: 'COUTO E NURNBERG COMERCIO DE PECAS LTDA',
  phone: '4130946911',
  parts: [
    {
      address: '1 11 9 7',
      code: '2200139',
      brand: 'SABO',
      description: 'JUNTAS CAMBIO',
      quantity: 1,
    },
    {
      address: '3 44 4 4',
      code: '21524615',
      brand: 'DT SC',
      description: 'ALTERNADOR',
      quantity: 1,
    },
  ],
};

export function scanSeparationMap(): Promise<ExtractedOrder> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(SEPARATION_MAP_SAMPLE), SCAN_DURATION_MS);
  });
}
