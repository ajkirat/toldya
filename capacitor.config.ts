import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Unique app ID — reverse domain notation (change 'ajink' to your name)
  appId: 'com.ajink.toldya',
  appName: 'ToldYa',

  // Vite builds to 'dist/' — Capacitor reads from here
  webDir: 'dist',

  server: {
    // Set to false for production builds (reads from dist/)
    // Set androidScheme to 'https' so localStorage works on Android
    androidScheme: 'https',
  },

  android: {
    // Allow WebView to access the internet (for RSS news feeds)
    allowMixedContent: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#0d1117',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
