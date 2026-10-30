import { Clock, MessageSquare, MapPin } from 'lucide-react';
import LocationsSettings from '@/components/settings/LocationsSettings';
import PickupDeadlineSettings from '@/components/settings/PickupDeadlineSettings';
import SettingsSection from '@/components/settings/SettingsSection';
import WhatsAppSettings from '@/components/settings/WhatsAppSettings';
import type { AppSettings } from '@/types/settings';

interface SettingsViewProps {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
}

export default function SettingsView({ settings, onChange }: SettingsViewProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-600">As alterações são salvas automaticamente neste navegador.</p>
      </div>

      <SettingsSection
        icon={MapPin}
        title="Cadastro de Localizações"
        description="Corredores, ruas e prateleiras disponíveis no estoque."
      >
        <LocationsSettings
          locations={settings.locations}
          onChange={(locations) => onChange({ locations })}
        />
      </SettingsSection>

      <SettingsSection
        icon={MessageSquare}
        title="Mensagens Automáticas"
        description="Texto enviado por WhatsApp ao cliente com o código PIN de retirada."
      >
        <WhatsAppSettings
          template={settings.whatsappTemplate}
          onChange={(whatsappTemplate) => onChange({ whatsappTemplate })}
        />
      </SettingsSection>

      <SettingsSection
        icon={Clock}
        title="Tempo Limite de Retirada"
        description="Quantos dias um pedido pode aguardar antes de ser marcado como atrasado."
      >
        <PickupDeadlineSettings
          days={settings.pickupDeadlineDays}
          onChange={(pickupDeadlineDays) => onChange({ pickupDeadlineDays })}
        />
      </SettingsSection>
    </main>
  );
}
