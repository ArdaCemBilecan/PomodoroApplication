export interface RadioStation {
  id: string; // YouTube video ID
  name: string;
  emoji: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  { id: 'jXAEIWcGXwE', name: 'Classic Lofi', emoji: '🎻' },
  { id: 'HuFYqnbVbzY', name: 'Jazz Lofi', emoji: '🎷' },
  { id: 'jfKfPfyJRdk', name: 'Hiphop Lofi', emoji: '🎧' },
  { id: '3GQY80jyysQ', name: 'Halloween Lofi', emoji: '🎃' },
  { id: 'Na0w3Mz46GA', name: 'Asia Lofi', emoji: '🍵' },
  { id: 'TtkFsfOP9QI', name: 'Piano Lofi', emoji: '🎹' },
  { id: 'Ftm2uv7-Ybw', name: 'Nature Camp', emoji: '⛺' },
];
