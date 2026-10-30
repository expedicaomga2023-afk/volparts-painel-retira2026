import { useState } from 'react';
import {
  PICKUP_DEADLINE_MAX_DAYS,
  PICKUP_DEADLINE_MIN_DAYS,
} from '@/constants/defaultSettings';

interface PickupDeadlineSettingsProps {
  days: number;
  onChange: (days: number) => void;
}

export default function PickupDeadlineSettings({ days, onChange }: PickupDeadlineSettingsProps) {
  const [draft, setDraft] = useState(String(days));

  const handleChange = (value: string) => {
    setDraft(value);
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed >= PICKUP_DEADLINE_MIN_DAYS && parsed <= PICKUP_DEADLINE_MAX_DAYS) {
      onChange(parsed);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex items-center gap-3">
        <input
          type="number"
          min={PICKUP_DEADLINE_MIN_DAYS}
          max={PICKUP_DEADLINE_MAX_DAYS}
          value={draft}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={() => setDraft(String(days))}
          className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-lg font-bold text-slate-900 transition focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
        />
        <span className="text-sm font-medium text-slate-700">dias</span>
      </label>
      <p className="max-w-md text-sm text-slate-600">
        Pedidos que ficarem aguardando por mais que este prazo recebem o alerta{' '}
        <span className="font-semibold text-red-700">Atrasado</span> no painel. Entre {PICKUP_DEADLINE_MIN_DAYS} e{' '}
        {PICKUP_DEADLINE_MAX_DAYS} dias.
      </p>
    </div>
  );
}
