package com.creatorx.api.integration;

import com.creatorx.common.enums.NotificationType;
import com.creatorx.repository.FCMTokenRepository;
import com.creatorx.repository.NotificationRepository;
import com.creatorx.repository.entity.FCMToken;
import com.creatorx.repository.entity.Notification;
import com.creatorx.repository.entity.User;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Notification API
 * Uses H2 database with BaseIntegrationTest authentication
 */
@DisplayName("Notification Integration Tests")
class NotificationIntegrationTest extends BaseIntegrationTest {

        @Autowired
        protected NotificationRepository notificationRepository;

        @Autowired
        protected FCMTokenRepository fcmTokenRepository;

        @Autowired
        protected EntityManager entityManager;

        private User user;
        private Notification notification;

        @BeforeEach
        @Override
        public void setUpBaseTest() {
                super.setUpBaseTest();

                // Clean up
                notificationRepository.deleteAll();
                fcmTokenRepository.deleteAll();

                // Use base test user
                user = testCreator;

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
        void shouldGetNotifications() throws Exception {
                authenticateAs(user);

                mockMvc.perform(get("/api/v1/notifications")
                                .param("page", "0")
                                .param("size", "20")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.items").isArray());
        }

        @Test
        @DisplayName("Should mark notification as read")
        void shouldMarkNotificationAsRead() throws Exception {
                authenticateAs(user);

                mockMvc.perform(put("/api/v1/notifications/{id}/read", notification.getId())
                                .with(csrf()))
                                .andExpect(status().isNoContent());

                // Clear entity cache to see the @Modifying update
                entityManager.flush();
                entityManager.clear();

                // Verify notification is marked as read
                Notification updated = notificationRepository.findById(notification.getId()).orElseThrow();
                org.junit.jupiter.api.Assertions.assertTrue(Boolean.TRUE.equals(updated.getRead()),
                                "Notification should be marked as read");
        }

        @Test
        @DisplayName("Should mark all notifications as read")
        void shouldMarkAllNotificationsAsRead() throws Exception {
                authenticateAs(user);

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
        void shouldGetUnreadCount() throws Exception {
                authenticateAs(user);

                mockMvc.perform(get("/api/v1/notifications/unread-count")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.count").value(1));
        }

        @Test
        @DisplayName("Should register FCM token")
        void shouldRegisterFCMToken() throws Exception {
                authenticateAs(user);

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
        void shouldUnregisterFCMToken() throws Exception {
                authenticateAs(user);

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
