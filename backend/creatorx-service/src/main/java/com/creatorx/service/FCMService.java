package com.creatorx.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Firebase Cloud Messaging (FCM) Service
 * Handles push notification delivery via FCM
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FCMService {
    
    private final FirebaseMessaging firebaseMessaging;
    
    /**
     * Send push notification to a single device
     */
    public void sendPushNotification(String fcmToken, String title, String body, Map<String, String> data) {
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
            
            String response = firebaseMessaging.send(message);
            log.info("Push notification sent successfully. Message ID: {}", response);
            
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send push notification to token: {}", fcmToken, e);
            throw new RuntimeException("Failed to send push notification: " + e.getMessage(), e);
        }
    }
    
    /**
     * Send push notification to multiple devices
     */
    public void sendPushNotificationToMultiple(List<String> fcmTokens, String title, String body, Map<String, String> data) {
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
            String response = firebaseMessaging.send(message);
            log.info("Push notification sent with Android config. Message ID: {}", response);
            
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send push notification with Android config", e);
            throw new RuntimeException("Failed to send push notification: " + e.getMessage(), e);
        }
    }
    
    /**
     * Send push notification with custom iOS config
     */
    public void sendPushNotificationWithIOSConfig(String fcmToken, String title, String body, 
                                                 Map<String, String> data, String sound) {
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
            String response = firebaseMessaging.send(message);
            log.info("Push notification sent with iOS config. Message ID: {}", response);
            
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send push notification with iOS config", e);
            throw new RuntimeException("Failed to send push notification: " + e.getMessage(), e);
        }
    }
}

