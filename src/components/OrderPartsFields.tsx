import { Plus, Trash2 } from 'lucide-react';
import { getInputClass } from '@/constants/formStyles';
import type { PartDraft, PartDraftErrors } from '@/utils/orderForm';

interface OrderPartsFieldsProps {
  parts: PartDraft[];
  rowErrors: PartDraftErrors[];
  partsError?: string;
  onChange: (index: number, patch: Partial<PartDraft>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export default function OrderPartsFields({
  parts,
  rowErrors,
  partsError,
  onChange,
  onAdd,
  onRemove,
}: OrderPartsFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">Peças</span>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
        >
          <Plus className="h-4 w-4" />
          Adicionar peça
        </button>
      </div>

      {partsError && <p className="text-xs font-medium text-red-600">{partsError}</p>}

      {parts.map((part, index) => {
        const errors = rowErrors[index] ?? {};
        return (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 sm:grid-cols-2"
          >
            <div className="min-w-0">
              <input
                type="text"
                aria-label={`Código do fabricante da peça ${index + 1}`}
                value={part.code}
                onChange={(event) => onChange(index, { code: event.target.value })}
                placeholder="Código"
                className={getInputClass(Boolean(errors.code))}
              />
              {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
            </div>
            <div className="min-w-0">
              <input
                type="text"
                aria-label={`Marca da peça ${index + 1}`}
                value={part.brand}
                onChange={(event) => onChange(index, { brand: event.target.value })}
                placeholder="Marca"
                className={getInputClass(false)}
              />
            </div>
            <div className="min-w-0">
              <input
                type="text"
                aria-label={`Endereço no estoque da peça ${index + 1}`}
                value={part.address}
                onChange={(event) => onChange(index, { address: event.target.value })}
                placeholder="Endereço no estoque"
                className={getInputClass(false)}
              />
            </div>
            <div className="min-w-0">
              <input
                type="number"
                aria-label={`Quantidade da peça ${index + 1}`}
                min={1}
                inputMode="numeric"
                value={part.quantity}
                onChange={(event) => onChange(index, { quantity: event.target.value })}
                placeholder="Qtd"
                className={getInputClass(Boolean(errors.quantity))}
              />
              {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
            </div>
            <div className="min-w-0 sm:col-span-2">
              <input
                type="text"
                aria-label={`Descrição da peça ${index + 1}`}
                value={part.description}
                onChange={(event) => onChange(index, { description: event.target.value })}
                placeholder="Descrição da peça"
                className={getInputClass(Boolean(errors.description))}
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>
            <div className="flex justify-end sm:col-span-2">
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={parts.length === 1}
                aria-label={`Remover peça ${index + 1}`}
                className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
