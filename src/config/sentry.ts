// To enable Sentry: run: npx expo install @sentry/react-native
/**
 * sentry.ts
 * Error reporting configuration.
 * Sentry captures crashes and errors from real users so the team
 * can fix problems before they affect everyone.
 *
 * To set up:
 * 1. Create a free account at sentry.io
 * 2. Create a new project (React Native)
 * 3. Copy your DSN and add to .env: EXPO_PUBLIC_SENTRY_DSN=your_dsn_here
 */
import { Platform } from 'react-native';

let sentryInitialized = false;

export const initSentry = () => {
  if (sentryInitialized) return;
  sentryInitialized = true;

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.log('Sentry DSN not configured - error reporting disabled');
    return;
  }

  const Sentry = (() => {
    try { return require('@sentry/react-native'); }
    catch { return null; }
  })();
  if (!Sentry) return;

  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_ENV ?? 'development',
    enableNative: Platform.OS !== 'web',
    tracesSampleRate: 0.2,
  });
};
