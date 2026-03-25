/**
 * BackgroundTimer.ts - Arka planda timer çalıştırma
 * Android: Foreground Service
 * iOS: Background Fetch
 * Web: requestAnimationFrame fallback
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const isNative = Capacitor.isNativePlatform();

class BackgroundTimerService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  async initialize(): Promise<void> {
    if (isNative) {
      // Bildirim izinlerini iste
      const permResult = await LocalNotifications.requestPermissions();
      console.log('[BG] Notification permission:', permResult.display);

      // Bildirim kanalı oluştur (Android)
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: 'pomodoro_timer',
          name: 'Pomodoro Timer',
          description: 'Timer bildirimleri',
          importance: 5, // Max importance
          visibility: 1,
          vibration: true,
          sound: 'notification.wav',
        });
      }
    }
    console.log('[BG] BackgroundTimer initialized');
  }

  /**
   * Timer'ı arka planda çalıştır
   * @param durationMs - Toplam süre (milisaniye)
   * @param onTick - Her saniye çağrılır (kalan ms)
   * @param onComplete - Timer bittiğinde çağrılır
   */
  start(
    durationMs: number,
    onTick: (remainingMs: number) => void,
    onComplete: () => void
  ): void {
    if (this.isRunning) {
      this.stop();
    }

    this.isRunning = true;
    const endTime = Date.now() + durationMs;

    this.intervalId = setInterval(() => {
      const remaining = endTime - Date.now();

      if (remaining <= 0) {
        this.stop();
        onComplete();
        this.sendCompletionNotification();
      } else {
        onTick(remaining);
      }
    }, 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // isRunning stays true - paused state
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Timer tamamlandığında native bildirim gönder
   */
  private async sendCompletionNotification(): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '🍅 Pomodoro Tamamlandı!',
            body: 'Harika iş çıkardın! Mola zamanı.',
            id: Date.now(),
            channelId: 'pomodoro_timer',
            schedule: { at: new Date() },
            sound: 'notification.wav',
            actionTypeId: 'POMODORO_COMPLETE',
          },
        ],
      });
    } catch (error) {
      console.warn('[BG] Notification failed:', error);
    }
  }

  /**
   * Mola hatırlatma bildirimi
   */
  async sendBreakNotification(breakType: 'short' | 'long'): Promise<void> {
    const title = breakType === 'short' ? '☕ Kısa Mola Bitti!' : '🌿 Uzun Mola Bitti!';
    const body = 'Odaklanmaya hazır mısın?';

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            channelId: 'pomodoro_timer',
            schedule: { at: new Date() },
            sound: 'notification.wav',
          },
        ],
      });
    } catch (error) {
      console.warn('[BG] Break notification failed:', error);
    }
  }

  /**
   * Tüm bekleyen bildirimleri temizle
   */
  async clearAllNotifications(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } catch (error) {
      console.warn('[BG] Clear notifications failed:', error);
    }
  }
}

export const backgroundTimer = new BackgroundTimerService();
