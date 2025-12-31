package com.creatorx.api.controller;

import com.creatorx.api.dto.AdminMessageRequest;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.service.admin.AdminMessageService;
import com.creatorx.service.admin.AdminPermissionService;
import com.creatorx.service.dto.ConversationDTO;
import com.creatorx.service.dto.MessageDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/messages")
@RequiredArgsConstructor
@Tag(name = "Admin Messages", description = "Admin messaging endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminMessageController {
    private final AdminMessageService adminMessageService;
    private final AdminPermissionService adminPermissionService;

    @GetMapping("/conversations")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List conversations", description = "List all conversations for admin")
    public Page<ConversationDTO> listConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_MESSAGES_MANAGE);
        return adminMessageService.listConversations(page, size);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get messages", description = "Get messages for a conversation")
    public Page<MessageDTO> getMessages(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_MESSAGES_MANAGE);
        return adminMessageService.getMessages(conversationId, page, size);
    }

    @PostMapping("/conversations/{conversationId}/messages")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Send message", description = "Send message as Team CreatorX")
    public MessageDTO sendMessage(
            @PathVariable String conversationId,
            @Valid @RequestBody AdminMessageRequest request,
            Authentication authentication
    ) {
        adminPermissionService.requirePermission(authentication.getName(), AdminPermissions.ADMIN_MESSAGES_MANAGE);
        return adminMessageService.sendMessage(conversationId, authentication.getName(), request.getContent());
    }
}
