import { RotateCcw } from 'lucide-react';
import { DEFAULT_WHATSAPP_TEMPLATE, WHATSAPP_TAGS } from '@/constants/defaultSettings';
import { renderWhatsappMessage } from '@/utils/whatsappMessage';

interface WhatsAppSettingsProps {
  template: string;
  onChange: (template: string) => void;
}

const PREVIEW_VARIABLES = { customerName: 'Maria Souza', orderNumber: 'PV-24811', pickupPin: '206686' };

export default function WhatsAppSettings({ template, onChange }: WhatsAppSettingsProps) {
  const preview = renderWhatsappMessage(template, PREVIEW_VARIABLES);

  const insertTag = (tag: string) => {
    const separator = template.length === 0 || template.endsWith(' ') ? '' : ' ';
    onChange(`${template}${separator}${tag}`);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inserir tag</span>
          {WHATSAPP_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => insertTag(tag)}
              className="rounded-md bg-sky-50 px-2 py-1 font-mono text-xs font-semibold text-sky-800 ring-1 ring-sky-200 transition hover:bg-sky-100"
            >
              {tag}
            </button>
          ))}
        </div>
        <textarea
          value={template}
          onChange={(event) => onChange(event.target.value)}
          rows={5}
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-900 transition focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <div className="rounded-xl bg-emerald-50/60 p-4 ring-1 ring-emerald-100">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
          Prévia para Maria Souza (PV-24811)
        </p>
        <p className="text-sm leading-relaxed text-slate-800">{preview || 'A mensagem está vazia.'}</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Enviada pelo botão Enviar Código PIN no card do pedido.</p>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_WHATSAPP_TEMPLATE)}
          disabled={template === DEFAULT_WHATSAPP_TEMPLATE}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar padrão
        </button>
      </div>
    </div>
  );
}
