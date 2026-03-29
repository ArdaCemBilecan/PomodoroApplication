import React, { useState, useEffect } from 'react';
import './BreathingGuide.css';

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

const BreathingGuide: React.FC = () => {
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    let timer: any;
    
    if (phase === 'inhale') {
      setTimeLeft(4);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPhase('hold');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (phase === 'hold') {
      setTimeLeft(7);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPhase('exhale');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (phase === 'exhale') {
      setTimeLeft(8);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Devam etmek istersek tekrar inhale diyebiliriz, 
            // ama burada 1 tur yapıp bitirmesini sağlayalım veya loopa alalım.
            setPhase('inhale');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [phase]);

  const toggleBreathing = () => {
    if (phase === 'idle') {
      setPhase('inhale');
    } else {
      setPhase('idle');
    }
  };

  const getInstruction = () => {
    if (phase === 'idle') return 'Rahatlamak İçin Başla';
    if (phase === 'inhale') return 'Nefes Al (4s)';
    if (phase === 'hold') return 'Nefes Tut (7s)';
    if (phase === 'exhale') return 'Nefes Ver (8s)';
    return '';
  };

  return (
    <div className="breathing-guide-wrapper fade-in">
      <div 
        className={`breathing-circle ${phase}`} 
        onClick={toggleBreathing}
      >
        <div className="breathing-content">
          <h4>{getInstruction()}</h4>
          {phase !== 'idle' && <h1 className="breath-timer">{timeLeft}</h1>}
          {phase === 'idle' && <p className="breath-subtitle">4-7-8 Tekniği</p>}
        </div>
      </div>
    </div>
  );
};

export default BreathingGuide;
