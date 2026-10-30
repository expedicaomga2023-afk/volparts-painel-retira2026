import { CheckCircle2, Clock, KeyRound, MessageCircle } from 'lucide-react';

interface PickupCodePanelProps {
  pin: string;
  sentAt?: string;
  onSend: () => void;
}

function formatSentTime(sentAt: string): string {
  return new Date(sentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function PickupCodePanel({ pin, sentAt, onSend }: PickupCodePanelProps) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-lg bg-sky-50 py-1 pl-2.5 pr-1 ring-1 ring-sky-100">
      <KeyRound className="h-3.5 w-3.5 shrink-0 text-sky-700" />
      <span className="font-mono text-sm font-bold tracking-[0.15em] text-slate-900">{pin}</span>
      <span
        className={`ml-auto flex h-5 items-center gap-1 whitespace-nowrap rounded px-1.5 text-[11px] font-semibold ${
          sentAt ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}
      >
        {sentAt ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
        {sentAt ? `Enviado ${formatSentTime(sentAt)}` : 'Não enviado'}
      </span>
      <button
        type="button"
        onClick={onSend}
        className="flex h-7 shrink-0 items-center gap-1 rounded-md bg-emerald-700 px-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {sentAt ? 'Reenviar' : 'Enviar PIN'}
      </button>
    </div>
  );
}
