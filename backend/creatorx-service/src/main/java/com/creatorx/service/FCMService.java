package com.creatorx.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Firebase Cloud Messaging (FCM) Service
 * Handles push notification delivery via FCM
 * 
 * NOTE: This service is designed to work even when Firebase is not configured.
 * All methods will log warnings and return gracefully if Firebase is
 * unavailable.
 */
@Slf4j
@Service
public class FCMService {

    private final Optional<FirebaseMessaging> firebaseMessaging;

    public FCMService(Optional<FirebaseMessaging> firebaseMessaging) {
        this.firebaseMessaging = firebaseMessaging;
        if (firebaseMessaging.isEmpty()) {
            log.warn("FCMService initialized without Firebase - push notifications are disabled");
        }
    }

    /**
     * Check if FCM is available
     */
    public boolean isAvailable() {
        return firebaseMessaging.isPresent();
    }

    /**
     * Send push notification to a single device
     */
    public void sendPushNotification(String fcmToken, String title, String body, Map<String, String> data) {
        if (firebaseMessaging.isEmpty()) {
            log.debug("FCM not available - skipping push notification to token: {}", fcmToken);
            return;
        }

        try {
            Message.Builder messageBuilder = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build());

            // Add data payload
            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();

            String response = firebaseMessaging.get().send(message);
            log.info("Push notification sent successfully. Message ID: {}", response);

        } catch (FirebaseMessagingException e) {
            log.error("Failed to send push notification to token: {}", fcmToken, e);
            // Don't throw - allow app to continue even if push fails
        }
    }

    /**
     * Send push notification to multiple devices
     */
    public void sendPushNotificationToMultiple(List<String> fcmTokens, String title, String body,
            Map<String, String> data) {
        if (firebaseMessaging.isEmpty()) {
            log.debug("FCM not available - skipping push notification to {} tokens", fcmTokens.size());
            return;
        }

        for (String token : fcmTokens) {
            try {
                sendPushNotification(token, title, body, data);
            } catch (Exception e) {
                log.error("Failed to send push notification to token: {}", token, e);
                // Continue with other tokens
            }
        }
    }

    /**
     * Send push notification with custom Android config
     */
    public void sendPushNotificationWithAndroidConfig(String fcmToken, String title, String body,
            Map<String, String> data, String channelId) {
        if (firebaseMessaging.isEmpty()) {
            log.debug("FCM not available - skipping Android push notification");
            return;
        }

        try {
            Message.Builder messageBuilder = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .setAndroidConfig(com.google.firebase.messaging.AndroidConfig.builder()
                            .setPriority(com.google.firebase.messaging.AndroidConfig.Priority.HIGH)
                            .setNotification(com.google.firebase.messaging.AndroidNotification.builder()
                                    .setChannelId(channelId)
                                    .setSound("default")
                                    .build())
                            .build());

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();
            String response = firebaseMessaging.get().send(message);
            log.info("Push notification sent with Android config. Message ID: {}", response);

        } catch (FirebaseMessagingException e) {
            log.error("Failed to send push notification with Android config", e);
            // Don't throw - allow app to continue
        }
    }

    /**
     * Send push notification with custom iOS config
     */
    public void sendPushNotificationWithIOSConfig(String fcmToken, String title, String body,
            Map<String, String> data, String sound) {
        if (firebaseMessaging.isEmpty()) {
            log.debug("FCM not available - skipping iOS push notification");
            return;
        }

        try {
            Message.Builder messageBuilder = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .setApnsConfig(com.google.firebase.messaging.ApnsConfig.builder()
                            .setAps(com.google.firebase.messaging.Aps.builder()
                                    .setSound(sound != null ? sound : "default")
                                    .setBadge(1)
                                    .build())
                            .build());

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();
            String response = firebaseMessaging.get().send(message);
            log.info("Push notification sent with iOS config. Message ID: {}", response);

        } catch (FirebaseMessagingException e) {
            log.error("Failed to send push notification with iOS config", e);
            // Don't throw - allow app to continue
        }
    }
}
