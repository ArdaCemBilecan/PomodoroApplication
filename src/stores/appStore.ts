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
  lofiVolume: number;         // 0-100
  whitenoiseVolume: number;   // 0-100
  soundPreset: string;
  theme: string;
}

export interface AppState {
  // Timer
  timer: TimerState;
  settings: SettingsState;

  // Timer Actions
  setTimerMode: (mode: TimerMode) => void;
  setTimerStatus: (status: TimerStatus) => void;
  setTimeLeft: (ms: number) => void;
  incrementSessions: () => void;
  resetSessions: () => void;
  setCurrentTaskName: (name: string) => void;
  toggleFlowMode: () => void;
  extendTimer: (minutes: number) => void;

  // Settings Actions
  updateSettings: (settings: Partial<SettingsState>) => void;
  setLofiVolume: (volume: number) => void;
  setWhitenoiseVolume: (volume: number) => void;

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
  lofiVolume: 50,
  whitenoiseVolume: 0,
  soundPreset: 'rain',
  theme: 'forest',
};

// ----- Store -----
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      timer: { ...DEFAULT_TIMER },
      settings: { ...DEFAULT_SETTINGS },

      // Timer Actions
      setTimerMode: (mode) => {
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

      toggleFlowMode: () =>
        set({
          timer: {
            ...get().timer,
            flowModeEnabled: !get().timer.flowModeEnabled,
          },
        }),

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

      setLofiVolume: (volume) =>
        set({ settings: { ...get().settings, lofiVolume: volume } }),

      setWhitenoiseVolume: (volume) =>
        set({ settings: { ...get().settings, whitenoiseVolume: volume } }),

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
