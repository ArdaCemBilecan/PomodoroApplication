/**
 * AudioEngine.ts - Howler.js wrapper for audio management
 * Ses dosyalarını yönetir, crossfade ve volume kontrol sağlar
 */

import { Howl } from 'howler';

export interface SoundConfig {
  src: string;
  volume: number;
  loop: boolean;
}

class AudioEngineService {
  private sounds: Map<string, Howl> = new Map();
  private isInitialized = false;

  initialize(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log('[Audio] Engine initialized');
  }

  /**
   * Ses dosyasını yükle ve kaydet
   */
  load(id: string, config: SoundConfig): void {
    // Eğer zaten yüklüyse, önce kaldır
    if (this.sounds.has(id)) {
      this.sounds.get(id)!.unload();
    }

    const howl = new Howl({
      src: [config.src],
      volume: config.volume,
      loop: config.loop,
      preload: true,
      html5: false, // Web Audio API kullan (performance)
    });

    this.sounds.set(id, howl);
  }

  /**
   * Ses çal
   */
  play(id: string): void {
    const sound = this.sounds.get(id);
    if (sound && !sound.playing()) {
      sound.play();
    }
  }

  /**
   * Ses durdur
   */
  stop(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.stop();
    }
  }

  /**
   * Ses seviyesini ayarla (0-1)
   */
  setVolume(id: string, volume: number): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.volume(Math.max(0, Math.min(1, volume)));
    }
  }

  /**
   * Tüm sesleri durdur
   */
  stopAll(): void {
    this.sounds.forEach(sound => sound.stop());
  }

  /**
   * Crossfade: Bir sesi yavaşça kapatıp diğerini aç
   */
  crossfade(fromId: string, toId: string, durationMs = 2000): void {
    const fromSound = this.sounds.get(fromId);
    const toSound = this.sounds.get(toId);

    if (!fromSound || !toSound) return;

    const fromVolume = fromSound.volume();
    const toVolume = toSound.volume() || 0.5;
    const steps = 20;
    const stepMs = durationMs / steps;
    let step = 0;

    // Hedef sesi başlat
    toSound.volume(0);
    if (!toSound.playing()) {
      toSound.play();
    }

    const fadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;

      fromSound.volume(fromVolume * (1 - progress));
      toSound.volume(toVolume * progress);

      if (step >= steps) {
        clearInterval(fadeInterval);
        fromSound.stop();
        fromSound.volume(fromVolume); // Reset volume
      }
    }, stepMs);
  }

  /**
   * Ses çalıyor mu?
   */
  isPlaying(id: string): boolean {
    const sound = this.sounds.get(id);
    return sound ? sound.playing() : false;
  }

  /**
   * Tüm sesleri temizle (memory cleanup)
   */
  destroy(): void {
    this.sounds.forEach(sound => sound.unload());
    this.sounds.clear();
    this.isInitialized = false;
  }
}

export const audioEngine = new AudioEngineService();
