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
