import { Cloud, CloudOff, Download, RefreshCw, Wrench } from 'lucide-react';
import AppTabs from '@/components/AppTabs';
import type { AppTab } from '@/constants/appTabs';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import type { SyncStatus } from '@/hooks/useSyncedOrders';

interface AppHeaderProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
  syncStatus: SyncStatus;
  pendingCount: number;
}

function SyncIndicator({ status, pendingCount }: { status: SyncStatus; pendingCount: number }) {
  if (status === 'offline') {
    return (
      <span
        className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
        title="Sem conexão com a nuvem. As alterações ficam salvas neste aparelho e serão enviadas automaticamente."
      >
        <CloudOff className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          Offline{pendingCount > 0 ? ` · ${pendingCount} pendente${pendingCount > 1 ? 's' : ''}` : ''}
        </span>
      </span>
    );
  }
  if (status === 'sincronizando' || pendingCount > 0) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        <span className="hidden sm:inline">Sincronizando</span>
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
      title="Dados sincronizados com a nuvem"
    >
      <Cloud className="h-3.5 w-3.5" />
      Sincronizado
    </span>
  );
}

export default function AppHeader({
  activeTab,
  onChange,
  syncStatus,
  pendingCount,
}: AppHeaderProps) {
  const { canInstall, install } = useInstallPrompt();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-stretch justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700">
            <Wrench className="h-5 w-5 text-white" strokeWidth={2.25} />
          </div>
          <div className="leading-tight">
            <p className="text-base font-extrabold tracking-tight text-slate-900">VOLPARTS</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Comércio de peças</p>
          </div>
          <SyncIndicator status={syncStatus} pendingCount={pendingCount} />
          {canInstall && (
            <button
              type="button"
              onClick={install}
              className="flex items-center gap-1 rounded-full bg-blue-700 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-blue-800"
              title="Instalar o Painel de Retirada neste aparelho"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Instalar app</span>
            </button>
          )}
        </div>
        <AppTabs activeTab={activeTab} onChange={onChange} />
      </div>
    </header>
  );
}
