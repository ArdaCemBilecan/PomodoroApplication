import React, { useEffect, useRef } from 'react';
import { IonIcon, IonRange, IonLabel } from '@ionic/react';
import { volumeMediumOutline, playOutline, pauseOutline } from 'ionicons/icons';
import { useAppStore } from '../../../stores/appStore';
import { RADIO_STATIONS } from '../constants/radioStations';
import { AMBIENT_SOUNDS, initSoundscapes, updateAmbientVolume } from '../Soundscapes';
import './AudioMixer.css';

const AudioMixer: React.FC = () => {
  const { settings, setRadioId, setRadioVolume, setAmbientVolume } = useAppStore();
  const { currentRadioId, radioVolume, ambientRainVolume, ambientFireVolume, ambientBirdsVolume } = settings;

  // Initialize howler sounds
  useEffect(() => {
    initSoundscapes();
  }, []);

  // Sync ambient volumes to Howler engine
  useEffect(() => {
    updateAmbientVolume('rain', ambientRainVolume);
    updateAmbientVolume('fire', ambientFireVolume);
    updateAmbientVolume('birds', ambientBirdsVolume);
  }, [ambientRainVolume, ambientFireVolume, ambientBirdsVolume]);

  const handleRadioClick = (id: string) => {
    if (currentRadioId === id) {
      // Toggle off manually
      setRadioId(null);
    } else {
      // Switch or turn on. When doing so, shut off ambient sounds.
      setRadioId(id);
      setAmbientVolume('rain', 0);
      setAmbientVolume('fire', 0);
      setAmbientVolume('birds', 0);
    }
  };

  const getAmbientVol = (id: string) => {
    switch (id) {
      case 'rain': return ambientRainVolume;
      case 'fire': return ambientFireVolume;
      case 'birds': return ambientBirdsVolume;
      default: return 0;
    }
  };

  return (
    <div className="audio-mixer-panel">
      
      {/* Radio Section */}
      <div className="mixer-section">
        <h3 className="mixer-title">📻 Lofi & Radyolar (YouTube)</h3>
        
        <div className="radio-chips-container">
          {RADIO_STATIONS.map((station) => (
            <button 
              key={station.id}
              className={`radio-chip ${currentRadioId === station.id ? 'active' : ''}`}
              onClick={() => handleRadioClick(station.id)}
            >
              <span className="radio-emoji">{station.emoji}</span>
              {station.name}
            </button>
          ))}
        </div>

        {/* Radio Volume Control */}
        <div className={`volume-control ${!currentRadioId ? 'disabled' : ''}`}>
          <IonIcon icon={volumeMediumOutline} />
          <IonRange 
            min={0}
            max={100}
            value={radioVolume}
            disabled={!currentRadioId}
            onIonInput={(e) => setRadioVolume(e.detail.value as number)}
            color="primary"
          />
        </div>
      </div>

      <div className="mixer-divider" />

      {/* Ambient Section */}
      <div className="mixer-section">
        <h3 className="mixer-title">🏕️ Çevrimdışı Ambiyans</h3>
        
        <div className={`ambient-sliders ${currentRadioId ? 'disabled-overlay' : ''}`}>
          {currentRadioId && (
            <div className="disabled-message">
              Radyo çalarken ambiyans sesleri devre dışıdır.
            </div>
          )}

          {AMBIENT_SOUNDS.map((sound) => (
            <div key={sound.id} className="ambient-row">
              <span className="ambient-icon">{sound.emoji}</span>
              <IonLabel className="ambient-label">{sound.name}</IonLabel>
              <IonRange
                min={0}
                max={100}
                value={getAmbientVol(sound.id)}
                disabled={!!currentRadioId}
                onIonInput={(e) => setAmbientVolume(sound.id, e.detail.value as number)}
                color="success"
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AudioMixer;
