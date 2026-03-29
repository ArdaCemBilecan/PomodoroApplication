import { audioEngine } from '../../core/capacitor/AudioEngine';

export const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Yağmur', src: '/assets/sounds/rain.mp3', emoji: '🌧️' },
  { id: 'fire', name: 'Şömine', src: '/assets/sounds/fire.mp3', emoji: '🔥' },
  { id: 'birds', name: 'Ormanlık', src: '/assets/sounds/birds.mp3', emoji: '🌲' },
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
