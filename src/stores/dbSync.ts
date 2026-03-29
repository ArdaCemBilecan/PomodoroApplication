/**
 * dbSync.ts - Store <-> Database senkronizasyonu
 * Zustand store değiştiğinde DB'ye yazar (async, non-blocking)
 */

import { database } from '../core/capacitor/Database';
import { useAppStore, type SettingsState } from './appStore';

let syncInitialized = false;

/**
 * Store ayarlarını DB'ye yazar
 */
async function syncSettingsToDB(settings: SettingsState): Promise<void> {
  try {
    const entries = Object.entries(settings);
    for (const [key, value] of entries) {
      // camelCase -> snake_case
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      await database.setSetting(dbKey, String(value));
    }
  } catch (error) {
    console.warn('[Sync] Settings sync failed:', error);
  }
}

/**
 * DB'den ayarları yükler ve store'a uygular
 */
async function loadSettingsFromDB(): Promise<void> {
  try {
    const dbSettings = await database.getAllSettings();
    const { updateSettings } = useAppStore.getState();

    const settingsMap: Partial<SettingsState> = {};

    if (dbSettings.pomodoro_duration) {
      settingsMap.pomodoroDuration = parseInt(dbSettings.pomodoro_duration);
    }
    if (dbSettings.short_break_duration) {
      settingsMap.shortBreakDuration = parseInt(dbSettings.short_break_duration);
    }
    if (dbSettings.long_break_duration) {
      settingsMap.longBreakDuration = parseInt(dbSettings.long_break_duration);
    }
    if (dbSettings.sessions_before_long_break) {
      settingsMap.sessionsBeforeLongBreak = parseInt(dbSettings.sessions_before_long_break);
    }
    if (dbSettings.current_radio_id) {
      settingsMap.currentRadioId = dbSettings.current_radio_id === 'null' ? null : dbSettings.current_radio_id;
    }
    if (dbSettings.radio_volume) {
      settingsMap.radioVolume = parseInt(dbSettings.radio_volume);
    }
    if (dbSettings.theme) {
      settingsMap.theme = dbSettings.theme;
    }

    if (Object.keys(settingsMap).length > 0) {
      updateSettings(settingsMap);
    }

    console.log('[Sync] Settings loaded from DB');
  } catch (error) {
    console.warn('[Sync] Load settings failed:', error);
  }
}

/**
 * Store değişikliklerini dinleyip DB'ye senkronize eder
 * App başlangıcında bir kez çağrılmalı
 */
export function initDBSync(): void {
  if (syncInitialized) return;
  syncInitialized = true;

  // Önce DB'den mevcut ayarları yükle
  loadSettingsFromDB();

  // Store'u dinle, sadece settings değiştiğinde sync et
  let prevSettings = useAppStore.getState().settings;

  useAppStore.subscribe((state) => {
    if (state.settings !== prevSettings) {
      prevSettings = state.settings;
      // Debounce: Hızlı slider değişimlerinde her seferinde DB yazma
      syncSettingsToDB(state.settings);
    }
  });

  console.log('[Sync] DB sync initialized');
}
