import React, { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { Network } from '@capacitor/network';
import { useIonToast } from '@ionic/react';
import { useAppStore } from '../../../stores/appStore';

const RadioPlayer: React.FC = () => {
  const { settings, setRadioId } = useAppStore();
  const { currentRadioId, radioVolume } = settings;
  const [presentToast] = useIonToast();
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Network listening
  useEffect(() => {
    const handleNetworkChange = async () => {
      const status = await Network.getStatus();
      setIsOffline(!status.connected);

      if (!status.connected && currentRadioId) {
        // Interaktif öğe çalarken internet koparsa durdur
        if (playerRef.current) {
          playerRef.current.pauseVideo();
        }
        presentToast({
          message: 'İnternet bağlantınız koptuğu için radyo duraklatıldı.',
          duration: 3000,
          color: 'warning',
          position: 'top',
        });
      }
    };

    // İlk yüklemede de kontrol et
    handleNetworkChange();

    const listener = Network.addListener('networkStatusChange', handleNetworkChange);
    return () => {
      listener.then((l) => l.remove());
    };
  }, [currentRadioId, presentToast]);

  // Volume kontrolü
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(radioVolume);
    }
  }, [radioVolume]);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(radioVolume);
    event.target.playVideo();
  };

  const onError: YouTubeProps['onError'] = () => {
    presentToast({
      message: 'Radyo yüklenirken hata oluştu. Lütfen bağlantınızı kontrol edin.',
      duration: 3000,
      color: 'danger',
    });
    setRadioId(null);
  };

  if (!currentRadioId) return null;

  return (
    <div style={{ display: 'none' }}>
      <YouTube
        videoId={currentRadioId}
        opts={{
          height: '10',
          width: '10',
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            playsinline: 1,
          },
        }}
        onReady={onReady}
        onError={onError}
      />
    </div>
  );
};

export default RadioPlayer;
