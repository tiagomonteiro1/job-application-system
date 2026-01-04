import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jobmatch.app',
  appName: 'JobMatch AI',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    hostname: 'jobmatch.app'
  },
  plugins: {
    App: {
      appUrlOpen: {
        enabled: true
      }
    }
  }
};

export default config;
