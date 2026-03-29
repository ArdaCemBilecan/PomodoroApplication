/**
 * appStore.ts - Zustand ile global state yönetimi
 * Persist: SQLite'a otomatik kayıt (web'de localStorage)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ----- Types -----
export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  timeLeftMs: number;
  sessionsCompleted: number;
  currentTaskName: string;
  flowModeEnabled: boolean;
}

export interface SettingsState {
  pomodoroDuration: number;   // dakika
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  currentRadioId: string | null;  // YouTube Video ID
  radioVolume: number;            // 0-100
  ambientRainVolume: number;      // 0-100
  ambientFireVolume: number;      // 0-100
  ambientBirdsVolume: number;     // 0-100
  theme: string;
}

export interface AppState {
  // Timer
  timer: TimerState;
  settings: SettingsState;

  // Timer Actions
  setTimerMode: (mode: TimerMode, resetFlow?: boolean) => void;
  setTimerStatus: (status: TimerStatus) => void;
  setTimeLeft: (ms: number) => void;
  incrementSessions: () => void;
  resetSessions: () => void;
  setCurrentTaskName: (name: string) => void;
  toggleFlowMode: () => void;
  extendTimer: (minutes: number) => void;

  // Settings Actions
  updateSettings: (settings: Partial<SettingsState>) => void;
  setRadioVolume: (volume: number) => void;
  setAmbientVolume: (id: string, volume: number) => void;
  setRadioId: (id: string | null) => void;

  // Utility
  resetTimer: () => void;
}

// ----- Default Values -----
const DEFAULT_TIMER: TimerState = {
  mode: 'pomodoro',
  status: 'idle',
  timeLeftMs: 25 * 60 * 1000, // 25 dakika
  sessionsCompleted: 0,
  currentTaskName: '',
  flowModeEnabled: false,
};

const DEFAULT_SETTINGS: SettingsState = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  currentRadioId: null,
  radioVolume: 50,
  ambientRainVolume: 0,
  ambientFireVolume: 0,
  ambientBirdsVolume: 0,
  theme: 'forest',
};

// ----- Store -----
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      timer: { ...DEFAULT_TIMER },
      settings: { ...DEFAULT_SETTINGS },

      // Timer Actions
      setTimerMode: (mode, resetFlow = false) => {
        const { settings } = get();
        let duration: number;
        switch (mode) {
          case 'pomodoro':
            duration = settings.pomodoroDuration;
            break;
          case 'shortBreak':
            duration = settings.shortBreakDuration;
            break;
          case 'longBreak':
            duration = settings.longBreakDuration;
            break;
        }
        set({
          timer: {
            ...get().timer,
            mode,
            status: 'idle',
            timeLeftMs: duration * 60 * 1000,
            ...(resetFlow ? { flowModeEnabled: false } : {}),
          },
        });
      },

      setTimerStatus: (status) =>
        set({ timer: { ...get().timer, status } }),

      setTimeLeft: (ms) =>
        set({ timer: { ...get().timer, timeLeftMs: ms } }),

      incrementSessions: () =>
        set({
          timer: {
            ...get().timer,
            sessionsCompleted: get().timer.sessionsCompleted + 1,
          },
        }),

      resetSessions: () =>
        set({ timer: { ...get().timer, sessionsCompleted: 0 } }),

      setCurrentTaskName: (name) =>
        set({ timer: { ...get().timer, currentTaskName: name } }),

      toggleFlowMode: () => {
        const current = get().timer;
        const delta = current.flowModeEnabled ? -5 * 60 * 1000 : 5 * 60 * 1000;
        set({
          timer: {
            ...current,
            flowModeEnabled: !current.flowModeEnabled,
            timeLeftMs: Math.max(0, current.timeLeftMs + delta),
          },
        });
      },

      extendTimer: (minutes) =>
        set({
          timer: {
            ...get().timer,
            timeLeftMs: get().timer.timeLeftMs + minutes * 60 * 1000,
          },
        }),

      // Settings Actions
      updateSettings: (newSettings) =>
        set({ settings: { ...get().settings, ...newSettings } }),

      setRadioVolume: (volume) =>
        set({ settings: { ...get().settings, radioVolume: volume } }),

      setAmbientVolume: (id, volume) => {
        const settings = get().settings;
        let update = {};
        if (id === 'rain') update = { ambientRainVolume: volume };
        else if (id === 'fire') update = { ambientFireVolume: volume };
        else if (id === 'birds') update = { ambientBirdsVolume: volume };
        set({ settings: { ...settings, ...update } });
      },

      setRadioId: (id) =>
        set({ settings: { ...get().settings, currentRadioId: id } }),

      // Utility
      resetTimer: () => {
        const { settings } = get();
        set({
          timer: {
            ...DEFAULT_TIMER,
            timeLeftMs: settings.pomodoroDuration * 60 * 1000,
          },
        });
      },
    }),
    {
      name: 'pomodoro-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        timer: {
          sessionsCompleted: state.timer.sessionsCompleted,
          currentTaskName: state.timer.currentTaskName,
          flowModeEnabled: state.timer.flowModeEnabled,
          // timeLeftMs ve status persist etme (çünkü timer durumu geçici)
        },
      }),
    }
  )
);
