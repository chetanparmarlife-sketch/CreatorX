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
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Unit Tests")
class NotificationServiceTest {
    
    @Mock
    private NotificationRepository notificationRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private FCMTokenRepository fcmTokenRepository;
    
    @Mock
    private FCMService fcmService;
    
    @InjectMocks
    private NotificationService notificationService;
    
    private User user;
    private Notification notification;
    
    @BeforeEach
    void setUp() {
        user = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@example.com")
                .build();
        
        notification = Notification.builder()
                .id("notification-id")
                .user(user)
                .type(NotificationType.APPLICATION_STATUS_CHANGED)
                .title("Application Status Changed")
                .body("Your application has been selected")
                .dataJson(new HashMap<>())
                .read(false)
                .build();
    }
    
    @Test
    @DisplayName("Should create notification successfully")
    void shouldCreateNotificationSuccessfully() {
        // Given
        when(userRepository.findById(user.getId()))
                .thenReturn(Optional.of(user));
        when(notificationRepository.save(any())).thenReturn(notification);
        when(fcmTokenRepository.findActiveTokensByUserId(user.getId()))
                .thenReturn(List.of());
        
        // When
        NotificationDTO result = notificationService.createNotification(
                user.getId(),
                NotificationType.APPLICATION_STATUS_CHANGED,
                "Test Title",
                "Test Body",
                Map.of("campaignId", "campaign-123")
        );
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Application Status Changed");
        verify(notificationRepository).save(any());
    }
    
    @Test
    @DisplayName("Should throw exception when user not found")
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findById(user.getId()))
                .thenReturn(Optional.empty());
        
        // When/Then
        assertThatThrownBy(() -> notificationService.createNotification(
                user.getId(),
                NotificationType.APPLICATION_STATUS_CHANGED,
                "Title",
                "Body",
                null
        )).isInstanceOf(ResourceNotFoundException.class);
    }
    
    @Test
    @DisplayName("Should get notifications paginated")
    void shouldGetNotificationsPaginated() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> notificationPage = new PageImpl<>(List.of(notification));
        when(notificationRepository.findByUserId(user.getId(), pageable))
                .thenReturn(notificationPage);
        
        // When
        Page<NotificationDTO> result = notificationService.getNotifications(user.getId(), pageable);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo("notification-id");
    }
    
    @Test
    @DisplayName("Should mark notification as read")
    void shouldMarkNotificationAsRead() {
        // Given
        when(notificationRepository.markAsRead("notification-id", user.getId(), any(LocalDateTime.class)))
                .thenReturn(1);
        
        // When
        notificationService.markAsRead(user.getId(), "notification-id");
        
        // Then
        verify(notificationRepository).markAsRead("notification-id", user.getId(), any(LocalDateTime.class));
    }
    
    @Test
    @DisplayName("Should throw exception when notification not found for mark as read")
    void shouldThrowExceptionWhenNotificationNotFoundForMarkAsRead() {
        // Given
        when(notificationRepository.markAsRead("invalid-id", user.getId(), any(LocalDateTime.class)))
                .thenReturn(0);
        
        // When/Then
        assertThatThrownBy(() -> notificationService.markAsRead(user.getId(), "invalid-id"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
    
    @Test
    @DisplayName("Should mark all notifications as read")
    void shouldMarkAllNotificationsAsRead() {
        // Given
        when(notificationRepository.markAllReadForUser(user.getId(), any(LocalDateTime.class)))
                .thenReturn(5);
        
        // When
        notificationService.markAllAsRead(user.getId());
        
        // Then
        verify(notificationRepository).markAllReadForUser(user.getId(), any(LocalDateTime.class));
    }
    
    @Test
    @DisplayName("Should get unread count")
    void shouldGetUnreadCount() {
        // Given
        when(notificationRepository.countUnreadByUserId(user.getId()))
                .thenReturn(3L);
        
        // When
        int count = notificationService.getUnreadCount(user.getId());
        
        // Then
        assertThat(count).isEqualTo(3);
    }
    
    @Test
    @DisplayName("Should register FCM token")
    void shouldRegisterFCMToken() {
        // Given
        String fcmToken = "fcm-token-123";
        String deviceId = "device-123";
        
        when(userRepository.findById(user.getId()))
                .thenReturn(Optional.of(user));
        when(fcmTokenRepository.findByUserIdAndDeviceId(user.getId(), deviceId))
                .thenReturn(Optional.empty());
        when(fcmTokenRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        notificationService.registerFCMToken(
                user.getId(),
                fcmToken,
                deviceId,
                FCMToken.Platform.ANDROID
        );
        
        // Then
        verify(fcmTokenRepository).save(any(FCMToken.class));
    }
    
    @Test
    @DisplayName("Should update existing FCM token")
    void shouldUpdateExistingFCMToken() {
        // Given
        String fcmToken = "new-fcm-token";
        String deviceId = "device-123";
        
        FCMToken existingToken = FCMToken.builder()
                .id("token-id")
                .user(user)
                .fcmToken("old-token")
                .deviceId(deviceId)
                .platform(FCMToken.Platform.ANDROID)
                .active(true)
                .build();
        
        when(userRepository.findById(user.getId()))
                .thenReturn(Optional.of(user));
        when(fcmTokenRepository.findByUserIdAndDeviceId(user.getId(), deviceId))
                .thenReturn(Optional.of(existingToken));
        when(fcmTokenRepository.save(any())).thenReturn(existingToken);
        
        // When
        notificationService.registerFCMToken(
                user.getId(),
                fcmToken,
                deviceId,
                FCMToken.Platform.IOS
        );
        
        // Then
        assertThat(existingToken.getFcmToken()).isEqualTo(fcmToken);
        assertThat(existingToken.getPlatform()).isEqualTo(FCMToken.Platform.IOS);
        verify(fcmTokenRepository).save(existingToken);
    }
    
    @Test
    @DisplayName("Should send push notification to active tokens")
    void shouldSendPushNotificationToActiveTokens() {
        // Given
        FCMToken token1 = FCMToken.builder()
                .id("token-1")
                .user(user)
                .fcmToken("fcm-token-1")
                .deviceId("device-1")
                .platform(FCMToken.Platform.ANDROID)
                .active(true)
                .build();
        
        FCMToken token2 = FCMToken.builder()
                .id("token-2")
                .user(user)
                .fcmToken("fcm-token-2")
                .deviceId("device-2")
                .platform(FCMToken.Platform.IOS)
                .active(true)
                .build();
        
        when(fcmTokenRepository.findActiveTokensByUserId(user.getId()))
                .thenReturn(List.of(token1, token2));
        when(fcmTokenRepository.updateLastUsedAt(anyString())).thenReturn(1);
        
        // When
        notificationService.sendPushNotification(
                user.getId(),
                "Test Title",
                "Test Body",
                Map.of("key", "value")
        );
        
        // Then
        verify(fcmService, times(2)).sendPushNotification(anyString(), anyString(), anyString(), any());
        verify(fcmTokenRepository, times(2)).updateLastUsedAt(anyString());
    }
    
    @Test
    @DisplayName("Should handle FCM service unavailable gracefully")
    void shouldHandleFCMServiceUnavailableGracefully() {
        // Given
        NotificationService serviceWithoutFCM = new NotificationService(
                notificationRepository,
                userRepository,
                fcmTokenRepository,
                null // FCM service not available
        );
        
        FCMToken token = FCMToken.builder()
                .id("token-1")
                .user(user)
                .fcmToken("fcm-token-1")
                .deviceId("device-1")
                .platform(FCMToken.Platform.ANDROID)
                .active(true)
                .build();
        
        when(fcmTokenRepository.findActiveTokensByUserId(user.getId()))
                .thenReturn(List.of(token));
        
        // When - should not throw exception
        serviceWithoutFCM.sendPushNotification(
                user.getId(),
                "Test Title",
                "Test Body",
                Map.of()
        );
        
        // Then - should log warning but not fail
        verify(fcmTokenRepository).findActiveTokensByUserId(user.getId());
    }
}

