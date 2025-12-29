package com.creatorx.api.controller;

import com.creatorx.api.dto.FCMTokenRequest;
import com.creatorx.common.enums.NotificationType;
import com.creatorx.repository.entity.User;
import com.creatorx.service.NotificationService;
import com.creatorx.service.dto.NotificationDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "In-app and push notification endpoints")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {
    
    private final NotificationService notificationService;
    
    /**
     * Get notifications (paginated)
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get notifications", description = "Get paginated notifications for current user")
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationDTO> notifications = notificationService.getNotifications(userId, pageable);
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Mark notification as read
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark as read", description = "Mark a notification as read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        notificationService.markAsRead(userId, id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all as read", description = "Mark all notifications as read for current user")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        String userId = authentication.getName();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get unread count
     */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread count", description = "Get unread notification count for current user")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(Authentication authentication) {
        String userId = authentication.getName();
        int count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    /**
     * Register FCM token for push notifications
     */
    @PostMapping("/register-device")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Register device", description = "Register FCM token for push notifications")
    public ResponseEntity<Void> registerDevice(
            @Valid @RequestBody FCMTokenRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        notificationService.registerFCMToken(
                userId,
                request.getToken(),
                request.getDeviceId(),
                request.getPlatform()
        );
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    
    /**
     * Unregister FCM token (on logout or app uninstall)
     */
    @DeleteMapping("/unregister-device/{deviceId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Unregister device", description = "Unregister FCM token for device")
    public ResponseEntity<Void> unregisterDevice(
            @PathVariable String deviceId,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        notificationService.unregisterFCMToken(userId, deviceId);
        return ResponseEntity.noContent().build();
    }
}

