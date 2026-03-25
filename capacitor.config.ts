import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ardacem.pomodoro',
  appName: 'Pomodoro',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#4ade80',
      sound: 'notification.wav',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0d1117',
      showSpinner: false,
    },
  },
  android: {
    backgroundColor: '#0d1117',
  },
};

export default config;
