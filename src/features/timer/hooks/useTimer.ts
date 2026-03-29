/**
 * useTimer.ts - Pomodoro timer hook
 * Timer mantığı: Start, Pause, Resume, Stop, Extend
 * Pomodoro: 25dk → Short Break: 5dk → (4 seans sonra) Long Break: 15dk
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAppStore, type TimerMode } from '../../../stores/appStore';
import { database, type SessionRecord } from '../../../core/capacitor/Database';
import { backgroundTimer } from '../../../core/capacitor/BackgroundTimer';
import { getTodayDate, toISOString } from '../../../core/utils/TimeUtils';

export function useTimer() {
  const {
    timer,
    settings,
    setTimerStatus,
    setTimeLeft,
    setTimerMode,
    incrementSessions,
    extendTimer,
  } = useAppStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const endTimeRef = useRef<number>(0);

  // Timer'ı interval ile güncelle
  const tick = useCallback(() => {
    const now = Date.now();
    const remaining = endTimeRef.current - now;

    if (remaining <= 0) {
      // Timer bitti
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      setTimeLeft(0);
      handleTimerComplete();
    } else {
      setTimeLeft(remaining);
    }
  }, [setTimeLeft]);

  // Timer tamamlandığında
  const handleTimerComplete = useCallback(async () => {
    const currentMode = useAppStore.getState().timer.mode;
    const currentSettings = useAppStore.getState().settings;
    const currentTimer = useAppStore.getState().timer;

    // Pomodoro tamamlandıysa session kaydet
    if (currentMode === 'pomodoro') {
      try {
        await database.insertSession({
          start_time: toISOString(new Date(startTimeRef.current)),
          duration: currentSettings.pomodoroDuration,
          task_name: currentTimer.currentTaskName || null,
          energy_level: 3,
          completed: true,
          flow_mode: currentTimer.flowModeEnabled,
        });

        // Daily stats güncelle
        const today = getTodayDate();
        const todaySessions = await database.getSessionsByDateRange(
          `${today}T00:00:00`,
          `${today}T23:59:59`
        );
        const totalMinutes = todaySessions.reduce((sum: number, s: SessionRecord) => sum + s.duration, 0);
        
        await database.upsertDailyStat({
          date: today,
          total_focus_minutes: totalMinutes,
          peak_hour: new Date().getHours(),
          interruptions: 0,
          sessions_count: todaySessions.length,
        });

        console.log('[Timer] Session saved to DB');
      } catch (error) {
        console.warn('[Timer] Session save failed:', error);
      }

      incrementSessions();

      // Flow mode aktifse: Otomatik yeni pomodoro başlat
      if (currentTimer.flowModeEnabled) {
        setTimerMode('pomodoro');
        // Küçük gecikme ile otomatik başlat
        setTimeout(() => startTimer(), 500);
        return;
      }

      // Sonraki mode'u belirle
      const newSessionCount = currentTimer.sessionsCompleted + 1;
      if (newSessionCount >= currentSettings.sessionsBeforeLongBreak) {
        setTimerMode('longBreak');
        backgroundTimer.sendBreakNotification('long');
      } else {
        setTimerMode('shortBreak');
        backgroundTimer.sendBreakNotification('short');
      }
    } else {
      // Mola bitti → Pomodoro'ya dön
      setTimerMode('pomodoro');
    }

    setTimerStatus('idle');
  }, [incrementSessions, setTimerMode, setTimerStatus]);

  // Timer başlat
  const startTimer = useCallback(() => {
    const currentTimeLeft = useAppStore.getState().timer.timeLeftMs;
    
    // Eğer zaten çalışıyorsa, restart yapma
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    startTimeRef.current = Date.now();
    endTimeRef.current = Date.now() + currentTimeLeft;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = endTimeRef.current - now;

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setTimeLeft(0);
        handleTimerComplete();
      } else {
        setTimeLeft(remaining);
      }
    }, 100); // 100ms interval for smooth UI

    setTimerStatus('running');
    console.log('[Timer] Started');
  }, [setTimerStatus, setTimeLeft, handleTimerComplete]);

  // Timer duraklat
  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerStatus('paused');
    console.log('[Timer] Paused');
  }, [setTimerStatus]);

  // Timer devam ettir
  const resumeTimer = useCallback(() => {
    const currentTimeLeft = useAppStore.getState().timer.timeLeftMs;
    endTimeRef.current = Date.now() + currentTimeLeft;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = endTimeRef.current - now;

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setTimeLeft(0);
        handleTimerComplete();
      } else {
        setTimeLeft(remaining);
      }
    }, 100);

    setTimerStatus('running');
    console.log('[Timer] Resumed');
  }, [setTimerStatus, setTimeLeft, handleTimerComplete]);

  // Timer toggle (play/pause)
  const toggleTimer = useCallback(() => {
    const currentStatus = useAppStore.getState().timer.status;
    switch (currentStatus) {
      case 'idle':
        startTimer();
        break;
      case 'running':
        pauseTimer();
        break;
      case 'paused':
        resumeTimer();
        break;
    }
  }, [startTimer, pauseTimer, resumeTimer]);

  // Timer sıfırla
  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const currentMode = useAppStore.getState().timer.mode;
    setTimerMode(currentMode); // Mode'u tekrar set et (süreyi sıfırlar)
    setTimerStatus('idle');
    console.log('[Timer] Reset');
  }, [setTimerMode, setTimerStatus]);

  // Timer'ı 5 dakika uzat
  const extendTimerBy5 = useCallback(() => {
    extendTimer(5);
    if (intervalRef.current) {
      endTimeRef.current += 5 * 60 * 1000;
    }
    console.log('[Timer] Extended by 5 minutes');
  }, [extendTimer]);

  // Mode değiştir
  const switchMode = useCallback((mode: TimerMode) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerMode(mode);
    setTimerStatus('idle');
  }, [setTimerMode, setTimerStatus]);

  // Timer'ın toplam süresini hesapla (progress bar için)
  const getTotalDuration = useCallback((): number => {
    switch (timer.mode) {
      case 'pomodoro':
        return settings.pomodoroDuration * 60 * 1000;
      case 'shortBreak':
        return settings.shortBreakDuration * 60 * 1000;
      case 'longBreak':
        return settings.longBreakDuration * 60 * 1000;
      default:
        return settings.pomodoroDuration * 60 * 1000;
    }
  }, [timer.mode, settings]);

  // Progress hesapla (0 to 1)
  const progress = 1 - timer.timeLeftMs / getTotalDuration();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // State
    timer,
    settings,
    progress,
    totalDuration: getTotalDuration(),

    // Actions
    toggleTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    extendTimerBy5,
    switchMode,
  };
}
