/**
 * EnergyCalculator.ts - Akıllı süre ve enerji önerisi algoritması
 * Son 7 günün verisine göre optimal süre hesaplar
 */

import { database } from '../capacitor/Database';

export interface EnergySuggestion {
  suggestedDuration: number; // dakika
  peakHour: number | null;   // en verimli saat (0-23)
  confidence: number;        // güven skoru (0-100)
  message: string;           // Kullanıcıya gösterilecek mesaj
}

export async function calculateEnergySuggestion(): Promise<EnergySuggestion> {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await database.getSessionsByDateRange(
      sevenDaysAgo.toISOString(),
      now.toISOString()
    );

    // Yeterli veri yoksa default öner
    if (sessions.length < 3) {
      return {
        suggestedDuration: 25,
        peakHour: null,
        confidence: 20,
        message: 'Henüz yeterli veri yok. 25 dakikalık klasik Pomodoro öneriyorum!',
      };
    }

    // Saatlere göre verimlilik analizi
    const hourlyStats = new Map<number, { totalMin: number; count: number; avgEnergy: number }>();
    
    sessions.forEach(s => {
      const hour = new Date(s.start_time).getHours();
      const existing = hourlyStats.get(hour) || { totalMin: 0, count: 0, avgEnergy: 0 };
      existing.totalMin += s.duration;
      existing.count += 1;
      existing.avgEnergy = (existing.avgEnergy * (existing.count - 1) + (s.energy_level || 3)) / existing.count;
      hourlyStats.set(hour, existing);
    });

    // En verimli saati bul
    let peakHour = now.getHours();
    let maxEfficiency = 0;
    hourlyStats.forEach((stats, hour) => {
      const efficiency = stats.totalMin * stats.avgEnergy;
      if (efficiency > maxEfficiency) {
        maxEfficiency = efficiency;
        peakHour = hour;
      }
    });

    // Mevcut saate göre süre önerisi
    const currentHour = now.getHours();
    const currentHourStats = hourlyStats.get(currentHour);
    
    let suggestedDuration: number;
    let message: string;

    if (currentHourStats && currentHourStats.avgEnergy >= 4) {
      // Yüksek enerji saati - uzun seans öner
      suggestedDuration = 45;
      message = `Saat ${currentHour}:00'de verimliliğin çok yüksek! 45 dakikalık bir seans öneriyorum.`;
    } else if (currentHourStats && currentHourStats.avgEnergy >= 3) {
      // Orta enerji - normal Pomodoro
      suggestedDuration = 25;
      message = `Bu saatte normal bir enerji seviyendesin. 25 dakikalık Pomodoro ideal.`;
    } else if (currentHour >= 22 || currentHour < 6) {
      // Gece - kısa seans
      suggestedDuration = 15;
      message = `Gece geç saatlerde kısa bir odaklanma seansı öneriyorum.`;
    } else {
      // Düşük enerji veya veri yok
      suggestedDuration = 25;
      message = `Bugün saat ${String(peakHour).padStart(2, '0')}:00'de en verimli saatin. Şimdilik 25 dakika ile başla!`;
    }

    const confidence = Math.min(100, sessions.length * 10);

    return {
      suggestedDuration,
      peakHour,
      confidence,
      message,
    };
  } catch (error) {
    console.error('[Energy] Calculation failed:', error);
    return {
      suggestedDuration: 25,
      peakHour: null,
      confidence: 0,
      message: 'Klasik 25 dakika ile başlayalım!',
    };
  }
}

export interface InstantEnergySuggestion {
  focusDuration: number;
  shortBreakDuration: number;
  message: string;
}

/**
 * Kullanıcı enerji seviyesine (1-5) göre anlık optimal zaman dilimlerini hesaplar.
 * @param level Enerji seviyesi (1: Tükenmiş, 5: Çok Yüksek)
 * @param defaultFocus Kullanıcının mağaza ayarındaki genel odaklanma süresi
 * @param defaultBreak Kullanıcının mağaza ayarındaki genel mola süresi
 */
export const calculateOptimalFlow = (
  level: number,
  defaultFocus: number,
  defaultBreak: number
): InstantEnergySuggestion => {
  switch (level) {
    case 1:
      return {
        focusDuration: 10,
        shortBreakDuration: 5,
        message: 'Tükenmiş görünüyorsun. Yorucu bir seans yerine ısınma niteliğinde 10 dakikalık hızlı bir odaklanma yapalım.',
      };
    case 2:
      return {
        focusDuration: 15,
        shortBreakDuration: 5,
        message: 'Enerjin biraz düşük. Kendini zorlamak yerine 15 dakikalık hafif bir seansla başlamaya ne dersin?',
      };
    case 3:
      return {
        focusDuration: 25,
        shortBreakDuration: 5,
        message: 'Normal enerjidesin! 25 dakikalık standart Pomodoro seansıyla devam etmek en iyisi.',
      };
    case 4:
      return {
        focusDuration: 40,
        shortBreakDuration: 10,
        message: 'Harika hissediyorsun! Odak noktanı kaybetmeden 40 dakikalık derin bir çalışmaya var mısın?',
      };
    case 5:
      return {
        focusDuration: 50,
        shortBreakDuration: 10,
        message: 'Enerjin tavan yapmış! Akışa girelim ve seni hiç bölmeyelim. 50 dakikalık devasa bir seans başlasın!',
      };
    default:
      return {
        focusDuration: defaultFocus,
        shortBreakDuration: defaultBreak,
        message: 'Standart ayarlarla devam edelim.',
      };
  }
};
