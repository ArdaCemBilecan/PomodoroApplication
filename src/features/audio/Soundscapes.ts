import { audioEngine } from '../../core/capacitor/AudioEngine';

export const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Yağmur', src: 'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg', emoji: '🌧️' },
  { id: 'fire', name: 'Şömine', src: 'https://actions.google.com/sounds/v1/emergency/crackling_fireplace.ogg', emoji: '🔥' },
  { id: 'birds', name: 'Ormanlık', src: 'https://actions.google.com/sounds/v1/nature/birds_in_forest.ogg', emoji: '🌲' },
  { id: 'wind', name: 'Rüzgar', src: 'https://actions.google.com/sounds/v1/weather/strong_wind.ogg', emoji: '🍃' },
  { id: 'ocean', name: 'Okyanus', src: 'https://actions.google.com/sounds/v1/water/ocean_waves.ogg', emoji: '🌊' },
  { id: 'cafe', name: 'Kafe', src: 'https://actions.google.com/sounds/v1/crowds/bar_crowd.ogg', emoji: '☕' },
];

let isInitialized = false;

export const initSoundscapes = () => {
  if (isInitialized) return;
  isInitialized = true;
  
  audioEngine.initialize();
  
  AMBIENT_SOUNDS.forEach((sound) => {
    audioEngine.load(sound.id, {
      src: sound.src,
      volume: 0,
      loop: true,
    });
  });
  
  console.log('[Audio] Ambient soundscapes initialized');
};

export const updateAmbientVolume = (id: string, volume: number) => {
  // Volume: 0 to 100
  const normalizedVol = volume / 100;
  
  audioEngine.setVolume(id, normalizedVol);
  
  if (normalizedVol > 0 && !audioEngine.isPlaying(id)) {
    audioEngine.play(id);
  } else if (normalizedVol === 0 && audioEngine.isPlaying(id)) {
    audioEngine.stop(id);
  }
};
