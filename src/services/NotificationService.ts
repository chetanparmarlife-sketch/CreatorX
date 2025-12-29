/**
 * Notification Service for React Native
 * Handles FCM push notifications and in-app notifications
 */

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';
import DeviceInfo from 'react-native-device-info';

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
      // Get device ID
      this.deviceId = await DeviceInfo.getUniqueId();
      
      // Request notification permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn('Notification permission not granted');
        return;
      }

      // Get FCM token
      this.fcmToken = await messaging().getToken();
      console.log('FCM Token:', this.fcmToken);

      // Register token with backend
      if (this.fcmToken && this.deviceId) {
        await this.registerDeviceToken(this.fcmToken, this.deviceId);
      }

      // Setup notification listeners
      this.setupNotificationListeners();

      // Handle token refresh
      messaging().onTokenRefresh(async (token) => {
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
    // Foreground messages - show in-app notification
    const unsubscribeForeground = messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
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
    messaging().setBackgroundMessageHandler(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('Background notification received:', remoteMessage);
        // Background messages are handled automatically by FCM
      }
    );

    // Notification opened app (when app was in background/quit)
    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('Notification opened app:', remoteMessage);
        this.handleNotificationTap(remoteMessage.data);
      }
    );

    // Check if app was opened from a notification (when app was quit)
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
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
      if (this.fcmToken) {
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

