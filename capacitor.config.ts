import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yeloeat.kiosk',
  appName: 'YeloEat Kiosk',
  webDir: 'dist',
  server: {
    url: 'https://yeo-eat-kiosk.vercel.app',
    cleartext: true,
    androidScheme: 'https'
  }
};

export default config;
