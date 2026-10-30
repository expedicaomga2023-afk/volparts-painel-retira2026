import { useState, type FormEvent } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import { sortLocations } from '@/utils/locationUtils';

interface LocationsSettingsProps {
  locations: string[];
  onChange: (locations: string[]) => void;
}

const LOCATION_MAX_LENGTH = 40;

export default function LocationsSettings({ locations, onChange }: LocationsSettingsProps) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sortedLocations = sortLocations(locations);

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draft.trim().replace(/\s+/g, ' ');

    if (!name) {
      setError('Digite o nome da localização.');
      return;
    }
    if (locations.some((location) => location.toLowerCase() === name.toLowerCase())) {
      setError('Essa localização já está cadastrada.');
      return;
    }

    onChange([...locations, name]);
    setDraft('');
    setError(null);
  };

  const handleRemove = (name: string) => {
    onChange(locations.filter((location) => location !== name));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Nova localização</span>
          <input
            type="text"
            value={draft}
            maxLength={LOCATION_MAX_LENGTH}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
            }}
            placeholder="Ex: Corredor G ou Prateleira 8"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
          />
        </label>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </form>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {sortedLocations.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-600">
          Nenhuma localização cadastrada.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {sortedLocations.map((location) => (
            <li
              key={location}
              className="flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pl-3 pr-1.5 text-sm font-medium text-slate-800 ring-1 ring-slate-200"
            >
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              {location}
              <button
                type="button"
                onClick={() => handleRemove(location)}
                aria-label={`Remover ${location}`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-100 hover:text-red-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
