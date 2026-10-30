import { useRef, useState, type ChangeEvent } from 'react';
import { Camera, CheckCircle2, Loader2 } from 'lucide-react';
import { scanSeparationMap, type ExtractedOrder } from '@/utils/orderOcr';

interface OrderScannerProps {
  onExtract: (order: ExtractedOrder) => void;
}

interface ScanResult {
  orderNumber: string;
  itemCount: number;
}

export default function OrderScanner({ onExtract }: OrderScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setResult(null);
    try {
      const extracted = await scanSeparationMap();
      onExtract(extracted);
      setResult({ orderNumber: extracted.orderNumber, itemCount: extracted.parts.length });
    } finally {
      input.value = '';
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-sky-300 bg-sky-50/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Preencher a partir do mapa de separação</p>
          <p className="text-xs text-slate-600">Tire uma foto ou envie o documento impresso.</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-sky-800 shadow-sm ring-1 ring-sky-200 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          Escanear Mapa de Separação (Foto/Arquivo)
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {isProcessing && (
        <div className="space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-sky-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-sky-600" />
          </div>
          <p className="text-xs font-medium text-slate-600">Lendo dados do pedido...</p>
        </div>
      )}

      {result && (
        <p className="flex items-start gap-2 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Pedido {result.orderNumber} preenchido com {result.itemCount} item(ns). Confira os campos antes de cadastrar.
        </p>
      )}
    </div>
  );
}
