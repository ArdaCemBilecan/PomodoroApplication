import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { flash } from 'ionicons/icons';
import { useAppStore } from '../../../stores/appStore';
import { calculateOptimalFlow, InstantEnergySuggestion } from '../../../core/utils/EnergyCalculator';
import './EnergySuggestionCard.css';

const EnergySuggestionCard: React.FC = () => {
  const { timer, settings, setEnergyLevel, updateSettings, setTimeLeft } = useAppStore();
  
  // Sadece idle (durumunda) ve pomodoro (odak) modundaysa göster
  if (timer.status !== 'idle' || timer.mode !== 'pomodoro') {
    return null;
  }

  const [hoverLevel, setHoverLevel] = useState<number | null>(null);
  const [suggestion, setSuggestion] = useState<InstantEnergySuggestion | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const handleLevelClick = (level: number) => {
    setSelectedLevel(level);
    const sug = calculateOptimalFlow(level, settings.pomodoroDuration, settings.shortBreakDuration);
    setSuggestion(sug);
  };

  const handleAccept = () => {
    if (suggestion && selectedLevel) {
      // Enerjiyi store'a yaz (Daha sonra veritabanına session finish anında gitmesi icin)
      setEnergyLevel(selectedLevel);
      
      // Süreyi güncelle (Ayarları kalıcı değiştiriyoruz ki progress bar düzgün çalışsın)
      updateSettings({
        pomodoroDuration: suggestion.focusDuration,
        shortBreakDuration: suggestion.shortBreakDuration,
      });

      // Anlık süreyi (timer ekrandaki) yeni odaklanma süresine sıfırla
      setTimeLeft(suggestion.focusDuration * 60 * 1000);
      
      // Öneriyi kapat
      setSuggestion(null);
    }
  };

  const handleReject = () => {
    setSuggestion(null);
    setSelectedLevel(null);
  };

  // Eğer zaten enerji seviyesi belirlendiyse veya zamanlayıcı akıyorsa basit bir indikatör göstersin
  if (timer.energyLevel) {
    return (
      <div 
        className="energy-active-indicator fade-in" 
        onClick={() => setEnergyLevel(null)}
        title="Enerji seviyesini değiştirmek için tıkla"
        style={{ cursor: 'pointer' }}
      >
        <IonIcon icon={flash} className="energy-icon-small" />
        <span>Enerji: {timer.energyLevel}/5</span>
      </div>
    );
  }

  return (
    <div className="energy-card fade-in">
      {!suggestion ? (
        <div className="energy-question-phase">
          <h4 className="energy-title">Şu an nasıl hissediyorsun?</h4>
          <div className="energy-bolts">
            {[1, 2, 3, 4, 5].map((level) => (
              <IonIcon
                key={level}
                icon={flash}
                className={`bolt-icon ${
                  (hoverLevel !== null ? level <= hoverLevel : false) ? 'active' : ''
                }`}
                onMouseEnter={() => setHoverLevel(level)}
                onMouseLeave={() => setHoverLevel(null)}
                onClick={() => handleLevelClick(level)}
              />
            ))}
          </div>
          <p className="energy-subtitle">Enerjine göre süreyi optimize edelim</p>
        </div>
      ) : (
        <div className="energy-suggestion-phase fade-in">
          <div className="suggestion-message-box">
            <IonIcon icon={flash} className="suggestion-icon glow" />
            <p className="suggestion-text">{suggestion.message}</p>
          </div>
          
          <div className="suggestion-details">
            <span className="detail-badge highlight">🎯 Odak: {suggestion.focusDuration} dk</span>
            <span className="detail-badge">☕ Mola: {suggestion.shortBreakDuration} dk</span>
          </div>

          <div className="suggestion-actions">
            <button className="btn-reject" onClick={handleReject}>Vazgeç</button>
            <button className="btn-accept" onClick={handleAccept}>Süreyi Güncelle</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergySuggestionCard;
