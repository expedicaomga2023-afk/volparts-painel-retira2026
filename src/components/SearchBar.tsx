import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function SearchBar({ value, onChange, resultCount, totalCount }: SearchBarProps) {
  return (
    <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 transition focus-within:ring-2 focus-within:ring-sky-500">
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="sr-only">Buscar por número do pedido ou nome do cliente</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por número do pedido ou nome do cliente"
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <p className="shrink-0 whitespace-nowrap text-sm text-slate-500">
        Exibindo <span className="font-semibold text-slate-900">{resultCount}</span> de{' '}
        <span className="font-semibold text-slate-900">{totalCount}</span> pedidos
      </p>
    </label>
  );
}
