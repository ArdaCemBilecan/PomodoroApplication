/**
 * TimerCircle.tsx - SVG dairesel progress timer bileşeni
 * 280px çapında, gradient stroke, breathing animasyonu
 */

import React from 'react';
import { formatTime } from '../../../core/utils/TimeUtils';
import './TimerCircle.css';

interface TimerCircleProps {
  timeLeftMs: number;
  progress: number; // 0 to 1
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  isRunning: boolean;
}

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MODE_LABELS: Record<string, string> = {
  pomodoro: 'FOCUS',
  shortBreak: 'SHORT BREAK',
  longBreak: 'LONG BREAK',
};

const MODE_COLORS: Record<string, { start: string; end: string }> = {
  pomodoro: { start: '#4ade80', end: '#22c55e' },
  shortBreak: { start: '#60a5fa', end: '#3b82f6' },
  longBreak: { start: '#fbbf24', end: '#f59e0b' },
};

const TimerCircle: React.FC<TimerCircleProps> = ({
  timeLeftMs,
  progress,
  mode,
  isRunning,
}) => {
  const safeProgress = isNaN(progress) || !isFinite(progress) ? 0 : Math.max(0, Math.min(1, progress));
  const offset = CIRCUMFERENCE * (1 - safeProgress);
  const colors = MODE_COLORS[mode] || MODE_COLORS.pomodoro;
  const safeTimeLeft = isNaN(timeLeftMs) ? 0 : timeLeftMs;

  return (
    <div className={`timer-circle-wrapper ${isRunning ? 'breathing' : ''}`}>
      <svg className="timer-svg" viewBox="0 0 280 280">
        {/* Background circle */}
        <circle
          cx="140"
          cy="140"
          r={RADIUS}
          fill="none"
          stroke={`rgba(${mode === 'pomodoro' ? '74, 222, 128' : mode === 'shortBreak' ? '96, 165, 250' : '251, 191, 36'}, 0.1)`}
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="140"
          cy="140"
          r={RADIUS}
          fill="none"
          stroke={`url(#timerGradient-${mode})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 140 140)"
          className="progress-ring"
        />
        <defs>
          <linearGradient id={`timerGradient-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
      </svg>
      <div className="timer-display">
        <span className="timer-time">{formatTime(safeTimeLeft)}</span>
        <span className={`timer-mode-label mode-${mode}`}>
          {MODE_LABELS[mode]}
        </span>
      </div>
    </div>
  );
};

export default TimerCircle;
