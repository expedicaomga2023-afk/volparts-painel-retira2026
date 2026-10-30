import { useCallback, useRef, useState } from 'react';
import { useSyncTriggers } from '@/hooks/useSyncTriggers';
import { fetchSettings, pushSettings } from '@/utils/cloudApi';
import {
  loadSettings,
  loadSettingsMeta,
  parseSettings,
  saveSettings,
  saveSettingsMeta,
  type SettingsSyncMeta,
} from '@/utils/settingsStorage';
import type { AppSettings } from '@/types/settings';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const settingsRef = useRef(settings);
  const metaRef = useRef(loadSettingsMeta());
  const runningRef = useRef(false);
  const queuedRef = useRef(false);

  const applyMeta = (meta: SettingsSyncMeta) => {
    metaRef.current = meta;
    saveSettingsMeta(meta);
  };

  const applySettings = (next: AppSettings) => {
    settingsRef.current = next;
    setSettings(next);
    saveSettings(next);
  };

  const syncOnce = async () => {
    if (metaRef.current.pending) {
      const sent = metaRef.current.updatedAt;
      await pushSettings({ data: { ...settingsRef.current }, updatedAt: sent });
      if (metaRef.current.updatedAt === sent) applyMeta({ updatedAt: sent, pending: false });
    }

    const remote = await fetchSettings();
    if (!remote || metaRef.current.pending || remote.updatedAt < metaRef.current.updatedAt) return;
    applySettings(parseSettings(remote.data));
    applyMeta({ updatedAt: remote.updatedAt, pending: false });
  };

  const sync = () => {
    if (runningRef.current) {
      queuedRef.current = true;
      return;
    }
    runningRef.current = true;
    syncOnce()
      .catch(() => {
        // Offline: the change stays queued in LocalStorage and is retried on the next sync.
      })
      .finally(() => {
        runningRef.current = false;
        if (queuedRef.current) {
          queuedRef.current = false;
          sync();
        }
      });
  };

  useSyncTriggers(sync);

  const syncRef = useRef(sync);
  syncRef.current = sync;

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    applySettings({ ...settingsRef.current, ...patch });
    applyMeta({ updatedAt: new Date().toISOString(), pending: true });
    syncRef.current();
  }, []);

  return { settings, updateSettings };
}
