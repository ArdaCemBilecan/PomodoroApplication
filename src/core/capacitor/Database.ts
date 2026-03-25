/**
 * Database.ts - Veritabanı yönetim katmanı
 * Offline-first: Tüm veriler cihazda saklanır
 * Web: localStorage fallback
 * Native: SQLite (capacitor-community/sqlite) - native build sırasında aktif edilecek
 */

// ----- Types -----
export interface SessionRecord {
  id: number;
  start_time: string;
  duration: number;
  task_name: string | null;
  energy_level: number | null;
  completed: boolean;
  flow_mode: boolean;
}

export interface DailyStatRecord {
  date: string;
  total_focus_minutes: number;
  peak_hour: number | null;
  interruptions: number;
  sessions_count: number;
}

export interface HourlyStatRecord {
  hour: number;
  day: string;
  total_minutes: number;
}

// ----- Web Storage Keys -----
const STORAGE_KEYS = {
  sessions: 'pomodoro_sessions',
  dailyStats: 'pomodoro_daily_stats',
  tasks: 'pomodoro_tasks',
  settings: 'pomodoro_settings',
};

// ----- Helper Functions -----
function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ----- Default Settings -----
const DEFAULT_SETTINGS: Record<string, string> = {
  pomodoro_duration: '25',
  short_break_duration: '5',
  long_break_duration: '15',
  sessions_before_long_break: '4',
  lofi_volume: '50',
  whitenoise_volume: '0',
  sound_preset: 'rain',
  theme: 'forest',
};

// ----- Database Service -----
class DatabaseService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Web platformda localStorage kullan
    const existing = getLocalData<Record<string, string>>(STORAGE_KEYS.settings, {});
    const merged = { ...DEFAULT_SETTINGS, ...existing };
    setLocalData(STORAGE_KEYS.settings, merged);

    console.log('[DB] localStorage initialized');
    this.initialized = true;
  }

  // ----- Sessions CRUD -----
  async insertSession(session: Omit<SessionRecord, 'id'>): Promise<number> {
    const sessions = getLocalData<SessionRecord[]>(STORAGE_KEYS.sessions, []);
    const id = sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1;
    sessions.push({ ...session, id });
    setLocalData(STORAGE_KEYS.sessions, sessions);
    return id;
  }

  async getSessions(limit = 50): Promise<SessionRecord[]> {
    const sessions = getLocalData<SessionRecord[]>(STORAGE_KEYS.sessions, []);
    return sessions.slice(-limit).reverse();
  }

  async getSessionsByDateRange(startDate: string, endDate: string): Promise<SessionRecord[]> {
    const sessions = getLocalData<SessionRecord[]>(STORAGE_KEYS.sessions, []);
    return sessions.filter(s => s.start_time >= startDate && s.start_time <= endDate);
  }

  // ----- Daily Stats CRUD -----
  async upsertDailyStat(stat: DailyStatRecord): Promise<void> {
    const stats = getLocalData<DailyStatRecord[]>(STORAGE_KEYS.dailyStats, []);
    const idx = stats.findIndex(s => s.date === stat.date);
    if (idx >= 0) {
      stats[idx] = stat;
    } else {
      stats.push(stat);
    }
    setLocalData(STORAGE_KEYS.dailyStats, stats);
  }

  async getDailyStats(days = 30): Promise<DailyStatRecord[]> {
    const stats = getLocalData<DailyStatRecord[]>(STORAGE_KEYS.dailyStats, []);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return stats.filter(s => new Date(s.date) >= cutoff);
  }

  // ----- Settings CRUD -----
  async getSetting(key: string): Promise<string | null> {
    const settings = getLocalData<Record<string, string>>(STORAGE_KEYS.settings, {});
    return settings[key] || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const settings = getLocalData<Record<string, string>>(STORAGE_KEYS.settings, {});
    settings[key] = value;
    setLocalData(STORAGE_KEYS.settings, settings);
  }

  async getAllSettings(): Promise<Record<string, string>> {
    return getLocalData<Record<string, string>>(STORAGE_KEYS.settings, {});
  }

  // ----- Heatmap Query -----
  async getHourlyStats(days = 30): Promise<HourlyStatRecord[]> {
    const sessions = getLocalData<SessionRecord[]>(STORAGE_KEYS.sessions, []);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const hourlyMap = new Map<string, number>();
    sessions
      .filter(s => s.completed && new Date(s.start_time) > cutoff)
      .forEach(s => {
        const d = new Date(s.start_time);
        const key = `${d.getDay()}-${d.getHours()}`;
        hourlyMap.set(key, (hourlyMap.get(key) || 0) + s.duration);
      });

    return Array.from(hourlyMap.entries()).map(([key, total_minutes]) => {
      const [day, hour] = key.split('-');
      return { day, hour: parseInt(hour), total_minutes };
    });
  }
}

// Singleton export
export const database = new DatabaseService();
