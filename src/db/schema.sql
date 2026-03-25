-- Pomodoro Application Database Schema
-- Offline-First: Tüm veriler cihazda saklanır

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_time DATETIME NOT NULL,
  duration INTEGER NOT NULL,          -- dakika cinsinden
  task_name TEXT,
  energy_level INTEGER CHECK(energy_level BETWEEN 1 AND 5),
  completed BOOLEAN DEFAULT 1,
  flow_mode BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Heatmap performansı için kritik index
CREATE INDEX IF NOT EXISTS idx_sessions_time ON sessions(start_time);

CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL UNIQUE,
  total_focus_minutes INTEGER DEFAULT 0,
  peak_hour INTEGER,                  -- En verimli saat (0-23)
  interruptions INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  total_minutes INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Default ayarları ekle
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('pomodoro_duration', '25'),
  ('short_break_duration', '5'),
  ('long_break_duration', '15'),
  ('sessions_before_long_break', '4'),
  ('lofi_volume', '50'),
  ('whitenoise_volume', '0'),
  ('sound_preset', 'rain'),
  ('theme', 'forest');
