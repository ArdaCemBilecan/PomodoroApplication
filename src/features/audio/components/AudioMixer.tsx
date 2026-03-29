import React, { useEffect, useRef } from 'react';
import { IonIcon, IonRange, IonLabel } from '@ionic/react';
import { volumeMediumOutline, playOutline, pauseOutline } from 'ionicons/icons';
import { useAppStore } from '../../../stores/appStore';
import { RADIO_STATIONS } from '../constants/radioStations';
import './AudioMixer.css';

const AudioMixer: React.FC = () => {
  const { settings, setRadioId, setRadioVolume } = useAppStore();
  const { currentRadioId, radioVolume } = settings;

  const handleRadioClick = (id: string) => {
    if (currentRadioId === id) {
      // Toggle off manually
      setRadioId(null);
    } else {
      // Switch or turn on.
      setRadioId(id);
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
    </div>
  );
};

export default AudioMixer;
