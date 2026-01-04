import { Linking } from 'react-native';

let WebBrowser: { openBrowserAsync?: (url: string) => Promise<unknown> } | null = null;

try {
  // Optional native dependency in preview; fall back to Linking if unavailable.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WebBrowser = require('expo-web-browser');
} catch {
  WebBrowser = null;
}

export async function openExternalUrl(url: string) {
  if (WebBrowser?.openBrowserAsync) {
    return WebBrowser.openBrowserAsync(url);
  }
  return Linking.openURL(url);
}
