import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yeloeat.kiosk',
  appName: 'YeloEat Kiosk',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
