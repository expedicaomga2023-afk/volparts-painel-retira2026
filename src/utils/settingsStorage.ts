import {
  DEFAULT_SETTINGS,
  PICKUP_DEADLINE_MAX_DAYS,
  PICKUP_DEADLINE_MIN_DAYS,
} from '@/constants/defaultSettings';
import type { AppSettings } from '@/types/settings';

const STORAGE_KEY = 'volparts:configuracoes';
const META_KEY = 'volparts:configuracoes-sync';

function isValidDeadline(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= PICKUP_DEADLINE_MIN_DAYS &&
    value <= PICKUP_DEADLINE_MAX_DAYS
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/** Validates settings from any source (LocalStorage or cloud), falling back to defaults per field. */
export function parseSettings(value: unknown): AppSettings {
  if (!value || typeof value !== 'object') return DEFAULT_SETTINGS;
  const parsed = value as Partial<Record<keyof AppSettings, unknown>>;
  return {
    locations: isStringArray(parsed.locations) ? parsed.locations : DEFAULT_SETTINGS.locations,
    whatsappTemplate:
      typeof parsed.whatsappTemplate === 'string'
        ? parsed.whatsappTemplate
        : DEFAULT_SETTINGS.whatsappTemplate,
    pickupDeadlineDays: isValidDeadline(parsed.pickupDeadlineDays)
      ? parsed.pickupDeadlineDays
      : DEFAULT_SETTINGS.pickupDeadlineDays,
  };
}

export function loadSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parseSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable (private mode or full quota); settings still apply for this session.
  }
}

export interface SettingsSyncMeta {
  /** When these settings were last changed; empty if never changed on this device. */
  updatedAt: string;
  /** True while a local change has not been confirmed by the cloud. */
  pending: boolean;
}

export function loadSettingsMeta(): SettingsSyncMeta {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(META_KEY) ?? 'null');
    return {
      updatedAt: typeof parsed?.updatedAt === 'string' ? parsed.updatedAt : '',
      pending: parsed?.pending === true,
    };
  } catch {
    return { updatedAt: '', pending: false };
  }
}

export function saveSettingsMeta(meta: SettingsSyncMeta): void {
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // See saveSettings.
  }
}
