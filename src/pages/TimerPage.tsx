import {
  IonPage,
  IonContent,
} from '@ionic/react';
import { formatTime } from '../core/utils/TimeUtils';
import { useAppStore } from '../stores/appStore';
import './TimerPage.css';

const TimerPage: React.FC = () => {
  const { timer } = useAppStore();

  return (
    <IonPage>
      <IonContent fullscreen className="timer-page">
        <div className="timer-container">
          {/* Floating leaves background */}
          <div className="nature-bg">
            <div className="leaf leaf-1">🍃</div>
            <div className="leaf leaf-2">🍂</div>
            <div className="leaf leaf-3">🌿</div>
            <div className="leaf leaf-4">🍃</div>
          </div>

          {/* Timer Circle */}
          <div className="timer-circle-wrapper">
            <svg className="timer-svg" viewBox="0 0 280 280">
              {/* Background circle */}
              <circle
                cx="140"
                cy="140"
                r="130"
                fill="none"
                stroke="rgba(74, 222, 128, 0.1)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="140"
                cy="140"
                r="130"
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 130}`}
                strokeDashoffset={`${2 * Math.PI * 130 * (1 - timer.timeLeftMs / (25 * 60 * 1000))}`}
                transform="rotate(-90 140 140)"
                className="progress-ring"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>
            <div className="timer-display">
              <span className="timer-time">{formatTime(timer.timeLeftMs)}</span>
              <span className="timer-mode">
                {timer.mode === 'pomodoro' ? 'Odaklan' : 
                 timer.mode === 'shortBreak' ? 'Kısa Mola' : 'Uzun Mola'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="timer-controls">
            <button className="control-btn primary-btn">
              {timer.status === 'running' ? '⏸' : '▶'}
            </button>
          </div>

          {/* Status */}
          <div className="timer-status">
            <span className="session-count">
              Seans: {timer.sessionsCompleted}/4
            </span>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TimerPage;
