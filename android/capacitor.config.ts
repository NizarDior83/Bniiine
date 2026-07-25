import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Reverse-domain package id. Anything you own is fine; pick before the first Play Store upload.
  appId: 'com.bniine.merge',
  appName: 'Bniine',
  webDir: 'www',
  // Serve the packaged web app; no external URL loading.
  server: {
    androidScheme: 'https',
    // Uncomment during dev to point at your local dev server instead of the packaged www:
    // url: 'http://192.168.1.10:8010',
    // cleartext: true,
  },
  android: {
    backgroundColor: '#2B1810',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false, // set true for debug builds if you need chrome://inspect
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#2B1810',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#2B1810',
      overlaysWebView: false,
    },
    ScreenOrientation: {
      orientation: 'portrait',
    },
    KeepAwake: {
      // Keep screen on while playing so nobody times out mid-merge.
    },
  },
};

export default config;
