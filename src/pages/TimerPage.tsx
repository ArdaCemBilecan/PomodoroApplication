import {
  IonPage,
  IonContent,
} from '@ionic/react';
import { useTimer } from '../features/timer/hooks/useTimer';
import TimerCircle from '../features/timer/components/TimerCircle';
import './TimerPage.css';

const TimerPage: React.FC = () => {
  const {
    timer,
    settings,
    progress,
    toggleTimer,
    resetTimer,
    extendTimerBy5,
    switchMode,
    handleFlowToggle,
  } = useTimer();

  const showExtend = timer.status === 'running' && timer.timeLeftMs < 60 * 1000;

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
            <div className="leaf leaf-5">🌱</div>
          </div>

          {/* Mode Selector */}
          <div className="mode-selector">
            <button
              className={`mode-btn ${timer.mode === 'pomodoro' ? 'active' : ''}`}
              onClick={() => switchMode('pomodoro')}
            >
              Odaklan
            </button>
            <button
              className={`mode-btn ${timer.mode === 'shortBreak' ? 'active' : ''}`}
              onClick={() => switchMode('shortBreak')}
            >
              Kısa Mola
            </button>
            <button
              className={`mode-btn ${timer.mode === 'longBreak' ? 'active' : ''}`}
              onClick={() => switchMode('longBreak')}
            >
              Uzun Mola
            </button>
          </div>

          {/* Timer Circle */}
          <TimerCircle
            timeLeftMs={timer.timeLeftMs}
            progress={progress}
            mode={timer.mode}
            isRunning={timer.status === 'running'}
          />

          {/* Controls */}
          <div className="timer-controls">
            {/* Reset button */}
            {timer.status !== 'idle' && (
              <button
                className="control-btn secondary-btn"
                onClick={resetTimer}
                title="Sıfırla"
              >
                ↺
              </button>
            )}

            {/* Play/Pause button */}
            <button
              className={`control-btn primary-btn ${timer.status === 'running' ? 'running' : ''}`}
              onClick={toggleTimer}
            >
              {timer.status === 'running' ? '⏸' : '▶'}
            </button>

            {/* Extend +5 min button (visible when timer < 1 min) */}
            {showExtend && (
              <button
                className="control-btn extend-btn"
                onClick={extendTimerBy5}
                title="+5 dakika"
              >
                +5
              </button>
            )}
          </div>

          {/* Flow Mode Toggle */}
          <div className="flow-mode-section">
            <button
              className={`flow-btn ${timer.flowModeEnabled ? 'active neon-glow' : ''}`}
              onClick={handleFlowToggle}
            >
              <span className="flow-icon">⚡</span>
              <span className="flow-text">Flow Modu</span>
            </button>
          </div>

          {/* Status */}
          <div className="timer-status">
            <span className="session-count">
              Seans: {timer.sessionsCompleted}/{settings.sessionsBeforeLongBreak}
            </span>
            {timer.flowModeEnabled && (
              <span className="flow-indicator">⚡ Flow Mode</span>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TimerPage;
