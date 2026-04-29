/**
 * NotificationService.ts
 *
 * SETUP REQUIRED before push notifications will work:
 * Run these commands:
 *   npx expo install @react-native-firebase/messaging
 *   npx expo install react-native-device-info
 *
 * Also required:
 *   - Add google-services.json to the root (Android) - get from Firebase Console
 *   - Add GoogleService-Info.plist to the root (iOS) - get from Firebase Console
 *   - Add firebase config to app.json plugins section
 *
 * Why this matters: without push notifications, creators don't know when
 * their campaign is approved, payment received, or new message arrives.
 */

import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

// Safe Firebase import - app works without push notifications if package is not installed.
let messaging: any = null;
let DeviceInfo: any = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
  const deviceInfoModule = require('react-native-device-info');
  DeviceInfo = deviceInfoModule.default ?? deviceInfoModule;
} catch {
  console.log('Push notification packages not installed - notifications disabled');
}

export interface NotificationData {
  type?: string;
  campaignId?: string;
  applicationId?: string;
  conversationId?: string;
  deliverableId?: string;
  transactionId?: string;
  [key: string]: string | undefined;
}

class NotificationService {
  private deviceId: string | null = null;
  private fcmToken: string | null = null;
  private notificationListeners: Array<() => void> = [];

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      if (!messaging || !DeviceInfo) {
        // Push setup is optional until Firebase packages and config files are installed.
        return;
      }

      // Get device ID
      this.deviceId = await DeviceInfo.getUniqueId();
      
      // Request notification permission
      const messagingClient = messaging();
      const authStatus = await messagingClient.requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn('Notification permission not granted');
        return;
      }

      // Get FCM token
      this.fcmToken = await messagingClient.getToken();
      console.log('FCM Token:', this.fcmToken);

      // Register token with backend
      if (this.fcmToken && this.deviceId) {
        await this.registerDeviceToken(this.fcmToken, this.deviceId);
      }

      // Setup notification listeners
      this.setupNotificationListeners();

      // Handle token refresh
      messagingClient.onTokenRefresh(async (token: string) => {
        console.log('FCM token refreshed:', token);
        this.fcmToken = token;
        if (this.deviceId) {
          await this.registerDeviceToken(token, this.deviceId);
        }
      });

    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Register FCM token with backend
   */
  private async registerDeviceToken(token: string, deviceId: string): Promise<void> {
    try {
      await apiClient.post('/notifications/register-device', {
        token,
        deviceId,
        platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      });
      console.log('FCM token registered with backend');
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  }

  /**
   * Setup notification listeners
   */
  private setupNotificationListeners(): void {
    if (!messaging) {
      // Listener setup is skipped safely when Firebase messaging is not installed.
      return;
    }

    const messagingClient = messaging();

    // Foreground messages - show in-app notification
    const unsubscribeForeground = messagingClient.onMessage(
      async (remoteMessage: any) => {
        console.log('Foreground notification received:', remoteMessage);
        
        if (remoteMessage.notification) {
          // Show in-app notification
          Alert.alert(
            remoteMessage.notification.title || 'Notification',
            remoteMessage.notification.body || '',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Handle notification tap
                  this.handleNotificationTap(remoteMessage.data);
                },
              },
            ]
          );
        }
      }
    );

    // Background messages - handled by setBackgroundMessageHandler
    messagingClient.setBackgroundMessageHandler(
      async (remoteMessage: any) => {
        console.log('Background notification received:', remoteMessage);
        // Background messages are handled automatically by FCM
      }
    );

    // Notification opened app (when app was in background/quit)
    const unsubscribeOpened = messagingClient.onNotificationOpenedApp(
      (remoteMessage: any) => {
        console.log('Notification opened app:', remoteMessage);
        this.handleNotificationTap(remoteMessage.data);
      }
    );

    // Check if app was opened from a notification (when app was quit)
    messagingClient
      .getInitialNotification()
      .then((remoteMessage: any | null) => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          this.handleNotificationTap(remoteMessage.data);
        }
      });

    // Store unsubscribe functions
    this.notificationListeners.push(unsubscribeForeground, unsubscribeOpened);
  }

  /**
   * Handle notification tap - navigate to relevant screen
   */
  private handleNotificationTap(data?: NotificationData): void {
    if (!data) {
      return;
    }

    // Store notification data for navigation
    AsyncStorage.setItem('pendingNotification', JSON.stringify(data));

    // Emit event for navigation (can be handled by navigation service)
    // This will be handled by the app's navigation logic
    console.log('Notification tap handled:', data);
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      if (!messaging) {
        // Token lookup is a safe no-op until Firebase messaging is installed.
        return null;
      }

      if (!this.fcmToken) {
        this.fcmToken = await messaging().getToken();
      }
      return this.fcmToken;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Unregister device token (on logout)
   */
  async unregisterDevice(): Promise<void> {
    try {
      if (this.deviceId) {
        await apiClient.delete(`/notifications/unregister-device/${this.deviceId}`);
        console.log('FCM token unregistered');
      }
      
      // Delete token
      if (this.fcmToken && messaging) {
        await messaging().deleteToken();
        this.fcmToken = null;
      }
    } catch (error) {
      console.error('Failed to unregister device:', error);
    }
  }

  /**
   * Cleanup notification listeners
   */
  cleanup(): void {
    this.notificationListeners.forEach((unsubscribe) => unsubscribe());
    this.notificationListeners = [];
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
