import { ClipboardList, History, Settings } from 'lucide-react';
import { APP_TABS, type AppTab } from '@/constants/appTabs';

interface AppTabsProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

const TAB_ICONS = {
  painel: ClipboardList,
  historico: History,
  configuracoes: Settings,
} as const;

export default function AppTabs({ activeTab, onChange }: AppTabsProps) {
  return (
    <div className="flex items-stretch gap-1 overflow-x-auto" role="tablist">
      {APP_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab.value];
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`relative flex items-center gap-2 whitespace-nowrap px-3 text-sm font-semibold transition ${
              isActive ? 'text-blue-800' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            <span
              className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-blue-700 transition-transform duration-200 ${
                isActive ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
