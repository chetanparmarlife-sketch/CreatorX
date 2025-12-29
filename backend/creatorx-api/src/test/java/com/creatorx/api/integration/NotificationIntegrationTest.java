package com.creatorx.api.integration;

import com.creatorx.common.enums.NotificationType;
import com.creatorx.repository.FCMTokenRepository;
import com.creatorx.repository.NotificationRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.FCMToken;
import com.creatorx.repository.entity.Notification;
import com.creatorx.repository.entity.User;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Notification API
 * Uses TestContainers for real PostgreSQL database
 */
@DisplayName("Notification Integration Tests")
class NotificationIntegrationTest extends BaseIntegrationTest {
    
    @Autowired
    protected MockMvc mockMvc;
    
    @Autowired
    protected NotificationRepository notificationRepository;
    
    @Autowired
    protected FCMTokenRepository fcmTokenRepository;
    
    @Autowired
    protected UserRepository userRepository;
    
    private User user;
    private Notification notification;
    
    @BeforeEach
    void setUp() {
        // Clean up
        notificationRepository.deleteAll();
        fcmTokenRepository.deleteAll();
        userRepository.deleteAll();
        
        // Create test user
        user = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@test.com")
                .build();
        user = userRepository.save(user);
        
        // Create test notification
        notification = Notification.builder()
                .user(user)
                .type(NotificationType.APPLICATION_STATUS_CHANGED)
                .title("Application Status Changed")
                .body("Your application has been selected")
                .read(false)
                .build();
        notification = notificationRepository.save(notification);
    }
    
    @Test
    @DisplayName("Should get notifications")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldGetNotifications() throws Exception {
        mockMvc.perform(get("/api/v1/notifications")
                        .param("page", "0")
                        .param("size", "20")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").exists())
                .andExpect(jsonPath("$.content[0].title").value("Application Status Changed"));
    }
    
    @Test
    @DisplayName("Should mark notification as read")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldMarkNotificationAsRead() throws Exception {
        mockMvc.perform(put("/api/v1/notifications/{id}/read", notification.getId())
                        .with(csrf()))
                .andExpect(status().isNoContent());
        
        // Verify notification is marked as read
        Notification updated = notificationRepository.findById(notification.getId()).orElseThrow();
        assert updated.getRead();
    }
    
    @Test
    @DisplayName("Should mark all notifications as read")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldMarkAllNotificationsAsRead() throws Exception {
        // Create another notification
        Notification notification2 = Notification.builder()
                .user(user)
                .type(NotificationType.NEW_MESSAGE)
                .title("New Message")
                .body("You have a new message")
                .read(false)
                .build();
        notificationRepository.save(notification2);
        
        mockMvc.perform(put("/api/v1/notifications/read-all")
                        .with(csrf()))
                .andExpect(status().isNoContent());
        
        // Verify all notifications are marked as read
        long unreadCount = notificationRepository.countUnreadByUserId(user.getId());
        assert unreadCount == 0;
    }
    
    @Test
    @DisplayName("Should get unread count")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldGetUnreadCount() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));
    }
    
    @Test
    @DisplayName("Should register FCM token")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldRegisterFCMToken() throws Exception {
        String fcmTokenRequest = """
                {
                    "token": "fcm-token-123",
                    "deviceId": "device-123",
                    "platform": "ANDROID"
                }
                """;
        
        mockMvc.perform(post("/api/v1/notifications/register-device")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(fcmTokenRequest)
                        .with(csrf()))
                .andExpect(status().isCreated());
        
        // Verify token is registered
        var token = fcmTokenRepository.findByUserIdAndDeviceId(user.getId(), "device-123");
        assert token.isPresent();
        assert token.get().getFcmToken().equals("fcm-token-123");
    }
    
    @Test
    @DisplayName("Should unregister FCM token")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldUnregisterFCMToken() throws Exception {
        // Register token first
        FCMToken token = FCMToken.builder()
                .user(user)
                .fcmToken("fcm-token-123")
                .deviceId("device-123")
                .platform(FCMToken.Platform.ANDROID)
                .active(true)
                .build();
        fcmTokenRepository.save(token);
        
        mockMvc.perform(delete("/api/v1/notifications/unregister-device/device-123")
                        .with(csrf()))
                .andExpect(status().isNoContent());
        
        // Verify token is deactivated
        var updatedToken = fcmTokenRepository.findById(token.getId());
        assert updatedToken.isPresent();
        assert !updatedToken.get().getActive();
    }
}

