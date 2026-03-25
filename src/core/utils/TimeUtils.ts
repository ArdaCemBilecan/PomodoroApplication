/**
 * TimeUtils.ts - Tarih/saat formatlama yardımcıları
 */

/**
 * Milisaniyeyi MM:SS formatına çevir
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Milisaniyeyi HH:MM:SS formatına çevir (uzun süreler için)
 */
export function formatTimeLong(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return formatTime(ms);
}

/**
 * Dakikayı milisaniyeye çevir
 */
export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

/**
 * Milisaniyeyi dakikaya çevir
 */
export function msToMinutes(ms: number): number {
  return Math.floor(ms / (60 * 1000));
}

/**
 * Bugünün tarihini YYYY-MM-DD formatında döndür
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * ISO tarih string'ine çevir
 */
export function toISOString(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Relatif zaman (örn: "5 dakika önce")
 */
export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Az önce';
  if (diffMin < 60) return `${diffMin} dakika önce`;
  
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} saat önce`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  
  return date.toLocaleDateString('tr-TR');
}

/**
 * Gün isimlerini döndür (Türkçe)
 */
export function getDayName(dayIndex: number): string {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[dayIndex] || '';
}

/**
 * Kısa gün isimlerini döndür
 */
export function getDayNameShort(dayIndex: number): string {
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return days[dayIndex] || '';
}
