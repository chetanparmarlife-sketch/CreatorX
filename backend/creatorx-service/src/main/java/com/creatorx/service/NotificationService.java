package com.creatorx.service;

import com.creatorx.common.enums.NotificationType;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.FCMTokenRepository;
import com.creatorx.repository.NotificationRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.FCMToken;
import com.creatorx.repository.entity.Notification;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.NotificationDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final FCMTokenRepository fcmTokenRepository;
    private final FCMService fcmService;
    
    // Custom constructor to make FCMService optional
    public NotificationService(NotificationRepository notificationRepository,
                              UserRepository userRepository,
                              FCMTokenRepository fcmTokenRepository,
                              FCMService fcmService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.fcmTokenRepository = fcmTokenRepository;
        this.fcmService = fcmService;
    }
    
    /**
     * Create notification (in-app)
     */
    @Transactional
    public NotificationDTO createNotification(String userId, NotificationType type, String title, 
                                             String body, Map<String, Object> data) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .dataJson(data != null ? new HashMap<>(data) : new HashMap<>())
                .read(false)
                .build();
        
        notification = notificationRepository.save(notification);
        
        log.info("Notification created: {} for user: {} type: {}", notification.getId(), userId, type);
        
        // Send push notification if user has FCM tokens and is not online
        sendPushNotificationIfNeeded(userId, title, body, data);
        
        return toDTO(notification);
    }
    
    /**
     * Get notifications for user (paginated)
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotifications(String userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserId(userId, pageable);
        return notifications.map(this::toDTO);
    }
    
    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(String userId, String notificationId) {
        int updated = notificationRepository.markAsRead(notificationId, userId, LocalDateTime.now());
        if (updated == 0) {
            throw new ResourceNotFoundException("Notification", notificationId);
        }
        log.debug("Notification marked as read: {} for user: {}", notificationId, userId);
    }
    
    /**
     * Mark all notifications as read for user
     */
    @Transactional
    public void markAllAsRead(String userId) {
        int updated = notificationRepository.markAllReadForUser(userId, LocalDateTime.now());
        log.info("Marked {} notifications as read for user: {}", updated, userId);
    }
    
    /**
     * Get unread count for user
     */
    @Transactional(readOnly = true)
    public int getUnreadCount(String userId) {
        return (int) notificationRepository.countUnreadByUserId(userId);
    }
    
    /**
     * Send push notification via FCM
     */
    @Transactional
    public void sendPushNotification(String userId, String title, String body, Map<String, String> data) {
        List<FCMToken> tokens = fcmTokenRepository.findActiveTokensByUserId(userId);
        
        if (tokens.isEmpty()) {
            log.debug("No FCM tokens found for user: {}", userId);
            return;
        }
        
        int successCount = 0;
        int failureCount = 0;
        
        if (fcmService == null) {
            log.warn("FCMService is not available. Push notifications will not be sent.");
            return;
        }
        
        for (FCMToken token : tokens) {
            try {
                fcmService.sendPushNotification(
                        token.getFcmToken(),
                        title,
                        body,
                        data
                );
                
                // Update last used timestamp
                fcmTokenRepository.updateLastUsedAt(token.getId());
                successCount++;
                
            } catch (Exception e) {
                log.error("Failed to send push notification to token: {} for user: {}", 
                        token.getId(), userId, e);
                failureCount++;
                
                // Deactivate invalid tokens
                if (e.getMessage() != null && 
                    (e.getMessage().contains("Invalid") || e.getMessage().contains("NotRegistered"))) {
                    token.setActive(false);
                    fcmTokenRepository.save(token);
                }
            }
        }
        
        log.info("Push notification sent to user: {} - Success: {}, Failed: {}", 
                userId, successCount, failureCount);
    }
    
    /**
     * Register FCM token for user device
     */
    @Transactional
    public void registerFCMToken(String userId, String fcmToken, String deviceId, FCMToken.Platform platform) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        // Check if token already exists for this device
        FCMToken existingToken = fcmTokenRepository.findByUserIdAndDeviceId(userId, deviceId)
                .orElse(null);
        
        if (existingToken != null) {
            // Update existing token
            existingToken.setFcmToken(fcmToken);
            existingToken.setPlatform(platform);
            existingToken.setLastUsedAt(LocalDateTime.now());
            existingToken.setActive(true);
            fcmTokenRepository.save(existingToken);
            log.info("Updated FCM token for user: {} device: {}", userId, deviceId);
        } else {
            // Create new token
            FCMToken newToken = FCMToken.builder()
                    .user(user)
                    .fcmToken(fcmToken)
                    .deviceId(deviceId)
                    .platform(platform)
                    .lastUsedAt(LocalDateTime.now())
                    .active(true)
                    .build();
            fcmTokenRepository.save(newToken);
            log.info("Registered new FCM token for user: {} device: {}", userId, deviceId);
        }
    }
    
    /**
     * Unregister FCM token (when user logs out or uninstalls app)
     */
    @Transactional
    public void unregisterFCMToken(String userId, String deviceId) {
        fcmTokenRepository.findByUserIdAndDeviceId(userId, deviceId)
                .ifPresent(token -> {
                    token.setActive(false);
                    fcmTokenRepository.save(token);
                    log.info("Unregistered FCM token for user: {} device: {}", userId, deviceId);
                });
    }
    
    // Helper methods
    
    private NotificationDTO toDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .body(notification.getBody())
                .data(notification.getDataJson())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
    
    /**
     * Send push notification if user is not online (check WebSocket connection status)
     * For now, always send push. In production, check if user is connected via WebSocket.
     */
    private void sendPushNotificationIfNeeded(String userId, String title, String body, Map<String, Object> data) {
        // Convert data to String map for FCM
        Map<String, String> fcmData = new HashMap<>();
        if (data != null) {
            data.forEach((key, value) -> fcmData.put(key, value != null ? value.toString() : ""));
        }
        
        // TODO: Check if user is online via WebSocket connection
        // For now, send push notification
        sendPushNotification(userId, title, body, fcmData);
    }
}

