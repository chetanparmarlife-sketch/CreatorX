package com.creatorx.api.controller;

import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import com.creatorx.service.ConversationService;
import com.creatorx.service.MessageService;
import com.creatorx.service.admin.AdminMessageService;
import com.creatorx.service.dto.ConversationDTO;
import com.creatorx.service.dto.MessageDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

/**
 * Compatibility controller for /conversations endpoints.
 * Mirrors /messages/* behavior so existing clients keep working.
 */
@RestController
@RequestMapping("/api/v1/conversations")
@Tag(name = "Conversations", description = "Messaging conversation endpoints (compatibility layer)")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class ConversationController {
    private final ConversationService conversationService;
    private final MessageService messageService;
    private final AdminMessageService adminMessageService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get conversations", description = "Get conversations for current user")
    public ResponseEntity<ConversationsResponse> getConversations(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "50") int size
    ) {
        User currentUser = resolveCurrentUser();
        List<ConversationDTO> conversations;

        if (currentUser.getRole() == UserRole.ADMIN) {
            Page<ConversationDTO> adminPage = adminMessageService.listConversations(page, size);
            conversations = adminPage.getContent();
        } else {
            conversations = conversationService.getConversations(currentUser.getId());
        }

        List<ConversationResponse> payload = conversations.stream()
                .map(this::toConversationResponse)
                .toList();

        return ResponseEntity.ok(new ConversationsResponse(payload));
    }

    @GetMapping("/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get messages", description = "Get messages for conversation with pagination")
    public ResponseEntity<PaginatedResponse<MessageResponse>> getMessages(
            @PathVariable String id,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "50") int size
    ) {
        User currentUser = resolveCurrentUser();
        Page<MessageDTO> messages = currentUser.getRole() == UserRole.ADMIN
                ? adminMessageService.getMessages(id, page, size)
                : messageService.getMessages(id, page, size, currentUser.getId());

        return ResponseEntity.ok(
                PaginatedResponse.fromPage(messages.map(this::toMessageResponse))
        );
    }

    @PostMapping("/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Send message", description = "Send message to conversation (REST fallback)")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable String id,
            @Valid @RequestBody ConversationMessageRequest request
    ) {
        User currentUser = resolveCurrentUser();
        String content = resolveContent(request);

        MessageDTO message = currentUser.getRole() == UserRole.ADMIN
                ? adminMessageService.sendMessage(id, currentUser.getId(), content)
                : messageService.sendMessage(id, currentUser.getId(), content);

        return ResponseEntity.ok(toMessageResponse(message));
    }

    @PutMapping("/{id}/mark-read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark as read", description = "Mark conversation as read for current user")
    public ResponseEntity<Void> markRead(@PathVariable String id) {
        User currentUser = resolveCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN) {
            messageService.markAsRead(id, currentUser.getId());
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/application/{applicationId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get conversation by application", description = "Get conversation for an application")
    public ResponseEntity<ConversationResponse> getConversationByApplication(
            @PathVariable String applicationId
    ) {
        User currentUser = resolveCurrentUser();
        ConversationDTO conversation = conversationService.findByApplicationId(applicationId, currentUser.getId());
        return ResponseEntity.ok(toConversationResponse(conversation));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Unread count", description = "Total unread messages for current user")
    public ResponseEntity<Integer> getUnreadCount() {
        User currentUser = resolveCurrentUser();
        if (currentUser.getRole() == UserRole.ADMIN) {
            return ResponseEntity.ok(0);
        }
        return ResponseEntity.ok(messageService.getUnreadCount(currentUser.getId()));
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException("Unauthorized");
        }
        String principal = authentication.getName();
        Optional<User> byId = userRepository.findById(principal);
        if (byId.isPresent()) return byId.get();
        return userRepository.findByEmail(principal)
                .orElseThrow(() -> new BusinessException("User not found"));
    }

    private String resolveContent(ConversationMessageRequest request) {
        String text = request.getText() != null ? request.getText().trim() : "";
        String content = request.getContent() != null ? request.getContent().trim() : "";
        String resolved = !text.isBlank() ? text : content;
        if (resolved.isBlank()) {
            throw new BusinessException("Message content is required");
        }
        return resolved;
    }

    private ConversationResponse toConversationResponse(ConversationDTO dto) {
        MessageDTO lastMessage = dto.getLastMessage();
        MessagePreview preview = lastMessage == null
                ? null
                : new MessagePreview(
                        lastMessage.getId(),
                        lastMessage.getContent(),
                        lastMessage.getSenderId(),
                        lastMessage.getCreatedAt() != null ? lastMessage.getCreatedAt().toString() : null
                );

        UserSummary creator = new UserSummary(dto.getCreatorId(), dto.getCreatorName(), null);
        UserSummary brand = new UserSummary(dto.getBrandId(), dto.getBrandName(), null);

        return ConversationResponse.builder()
                .id(dto.getId())
                .campaignId(dto.getCampaignId())
                .campaignTitle(dto.getCampaignTitle())
                .creatorId(dto.getCreatorId())
                .brandId(dto.getBrandId())
                .creator(creator)
                .brand(brand)
                .unreadCount(dto.getUnreadCount() != null ? dto.getUnreadCount() : 0)
                .lastMessageAt(dto.getLastMessageAt() != null ? dto.getLastMessageAt().toString() : null)
                .lastMessage(preview)
                .createdAt(dto.getLastMessageAt() != null ? dto.getLastMessageAt().toString() : null)
                .updatedAt(dto.getLastMessageAt() != null ? dto.getLastMessageAt().toString() : null)
                .build();
    }

    private MessageResponse toMessageResponse(MessageDTO dto) {
        return MessageResponse.builder()
                .id(dto.getId())
                .conversationId(dto.getConversationId())
                .senderId(dto.getSenderId())
                .text(dto.getContent())
                .read(dto.getRead())
                .readAt(dto.getReadAt() != null ? dto.getReadAt().toString() : null)
                .createdAt(dto.getCreatedAt() != null ? dto.getCreatedAt().toString() : null)
                .status(dto.getDeliveryStatus())
                .build();
    }

    @Data
    public static class ConversationMessageRequest {
        private String text;
        private String content;
    }

    @Data
    public static class ConversationsResponse {
        private final List<ConversationResponse> conversations;
    }

    @Data
    @lombok.Builder
    public static class ConversationResponse {
        private String id;
        private String campaignId;
        private String campaignTitle;
        private String creatorId;
        private String brandId;
        private UserSummary creator;
        private UserSummary brand;
        private Integer unreadCount;
        private String lastMessageAt;
        private MessagePreview lastMessage;
        private String createdAt;
        private String updatedAt;
    }

    @Data
    public static class MessagePreview {
        private final String id;
        private final String text;
        private final String senderId;
        private final String createdAt;
    }

    @Data
    @lombok.Builder
    public static class MessageResponse {
        private String id;
        private String conversationId;
        private String senderId;
        private String text;
        private Boolean read;
        private String readAt;
        private String createdAt;
        private String status;
    }

    @Data
    public static class UserSummary {
        private final String id;
        private final String name;
        private final String avatarUrl;
    }

    @Data
    public static class PaginatedResponse<T> {
        private final List<T> items;
        private final int page;
        private final int size;
        private final long total;

        public static <T> PaginatedResponse<T> fromPage(Page<T> page) {
            return new PaginatedResponse<>(
                    page.getContent(),
                    page.getNumber(),
                    page.getSize(),
                    page.getTotalElements()
            );
        }
    }
}
