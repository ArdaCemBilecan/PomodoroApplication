import {
  IonPage,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
} from '@ionic/react';
import { musicalNotesOutline, closeOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useTimer } from '../features/timer/hooks/useTimer';
import TimerCircle from '../features/timer/components/TimerCircle';
import EnergySuggestionCard from '../features/timer/components/EnergySuggestionCard';
import BreathingGuide from '../features/wellness/components/BreathingGuide';
import AudioMixer from '../features/audio/components/AudioMixer';
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
  const [showMixerModal, setShowMixerModal] = useState(false);

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
              Focus
            </button>
            <button
              className={`mode-btn ${timer.mode === 'shortBreak' ? 'active' : ''}`}
              onClick={() => switchMode('shortBreak')}
            >
              Short Break
            </button>
            <button
              className={`mode-btn ${timer.mode === 'longBreak' ? 'active' : ''}`}
              onClick={() => switchMode('longBreak')}
            >
              Long Break
            </button>
          </div>

          {/* Energy Suggestion (Pomodoro) */}
          <EnergySuggestionCard />

          {/* Break Reminders & Breathing Guide */}
          {timer.mode === 'longBreak' && (
            <div className="movement-reminder fade-in">
              🌿 Please stand up and move around! Your body needs a break too.
            </div>
          )}
          {timer.mode !== 'pomodoro' && (
            <BreathingGuide />
          )}

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
                title="Reset"
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
                title="+5 Minutes"
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
              <span className="flow-text">Flow Mode</span>
            </button>
          </div>

          {/* Status */}
          <div className="timer-status">
            <span className="session-count">
              Session: {timer.sessionsCompleted}/{settings.sessionsBeforeLongBreak}
            </span>
            {timer.flowModeEnabled && (
              <span className="flow-indicator">⚡ Flow Mode</span>
            )}
          </div>
        </div>

        {/* Audio Modal Fab */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ margin: '16px' }}>
          <IonFabButton color="dark" onClick={() => setShowMixerModal(true)}>
            <IonIcon icon={musicalNotesOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal
          isOpen={showMixerModal}
          onDidDismiss={() => setShowMixerModal(false)}
          breakpoints={[0, 0.5, 0.8]}
          initialBreakpoint={0.5}
          className="audio-mixer-modal"
          style={{ '--background': 'transparent' }}
        >
          <div style={{ padding: '16px', background: 'transparent' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button 
                onClick={() => setShowMixerModal(false)}
                style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '8px', borderRadius: '50%' }}
              >
                <IonIcon icon={closeOutline} size="large" />
              </button>
            </div>
            <AudioMixer />
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default TimerPage;
