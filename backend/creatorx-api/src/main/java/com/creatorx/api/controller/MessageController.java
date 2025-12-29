package com.creatorx.api.controller;

import com.creatorx.repository.entity.User;
import com.creatorx.service.ConversationService;
import com.creatorx.service.MessageService;
import com.creatorx.service.dto.ChatMessageRequest;
import com.creatorx.service.dto.ConversationDTO;
import com.creatorx.service.dto.MessageDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Message controller for WebSocket and REST endpoints
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/messages")
@Tag(name = "Messages", description = "Real-time messaging endpoints")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class MessageController {
    
    private final MessageService messageService;
    private final ConversationService conversationService;
    
    /**
     * WebSocket endpoint: Send message
     * Clients send to: /app/chat.send
     * Message is sent to recipient via /user/{userId}/queue/messages
     */
    @MessageMapping("/chat.send")
    public void sendMessage(
            @Payload @Valid ChatMessageRequest request,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        User sender = getCurrentUser(headerAccessor);
        log.debug("Received message from user: {} in conversation: {}", sender.getId(), request.getConversationId());
        
        // MessageService handles sending to recipient via SimpMessagingTemplate
        messageService.sendMessage(
                request.getConversationId(),
                sender.getId(),
                request.getContent()
        );
    }
    
    /**
     * REST endpoint: Get messages for conversation
     */
    @GetMapping("/conversation/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get messages", description = "Get paginated messages for a conversation")
    public ResponseEntity<Page<MessageDTO>> getMessages(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        User currentUser = getCurrentUser();
        Page<MessageDTO> messages = messageService.getMessages(conversationId, page, size, currentUser.getId());
        return ResponseEntity.ok(messages);
    }
    
    /**
     * REST endpoint: Mark messages as read
     */
    @PutMapping("/conversation/{conversationId}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark as read", description = "Mark all messages in conversation as read")
    public ResponseEntity<Void> markAsRead(@PathVariable String conversationId) {
        User currentUser = getCurrentUser();
        messageService.markAsRead(conversationId, currentUser.getId());
        return ResponseEntity.ok().build();
    }
    
    /**
     * REST endpoint: Get unread count
     */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get unread count", description = "Get total unread message count for user")
    public ResponseEntity<Integer> getUnreadCount() {
        User currentUser = getCurrentUser();
        int count = messageService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(count);
    }
    
    /**
     * REST endpoint: Get conversations
     */
    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get conversations", description = "Get all conversations for user")
    public ResponseEntity<List<ConversationDTO>> getConversations() {
        User currentUser = getCurrentUser();
        List<ConversationDTO> conversations = conversationService.getConversations(currentUser.getId());
        return ResponseEntity.ok(conversations);
    }
    
    /**
     * REST endpoint: Get conversation by ID
     */
    @GetMapping("/conversations/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get conversation", description = "Get conversation by ID")
    public ResponseEntity<ConversationDTO> getConversation(@PathVariable String id) {
        User currentUser = getCurrentUser();
        ConversationDTO conversation = conversationService.getConversationById(id, currentUser.getId());
        return ResponseEntity.ok(conversation);
    }
    
    /**
     * REST endpoint: Get conversation by application ID
     */
    @GetMapping("/conversations/application/{applicationId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get conversation by application", description = "Get conversation for an application")
    public ResponseEntity<ConversationDTO> getConversationByApplication(@PathVariable String applicationId) {
        User currentUser = getCurrentUser();
        ConversationDTO conversation = conversationService.findByApplicationId(applicationId, currentUser.getId());
        return ResponseEntity.ok(conversation);
    }
    
    // Helper methods
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return (User) authentication.getPrincipal();
    }
    
    private User getCurrentUser(SimpMessageHeaderAccessor headerAccessor) {
        Authentication authentication = (Authentication) headerAccessor.getUser();
        if (authentication == null) {
            throw new RuntimeException("User not authenticated");
        }
        return (User) authentication.getPrincipal();
    }
}

