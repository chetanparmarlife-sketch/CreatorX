package com.creatorx.service;

import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.ConversationRepository;
import com.creatorx.repository.MessageRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Conversation;
import com.creatorx.repository.entity.Message;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.ConversationDTO;
import com.creatorx.service.dto.MessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Send message and broadcast via WebSocket
     */
    @Transactional
    public MessageDTO sendMessage(String conversationId, String senderId, String content) {
        // Load conversation
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));

        // Load sender
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User", senderId));

        // Verify sender is a participant (admins can send globally)
        boolean isAdminSender = sender.getRole() == UserRole.ADMIN;
        if (!isAdminSender &&
                !conversation.getCreator().getId().equals(senderId) &&
                !conversation.getBrand().getId().equals(senderId)) {
            throw new UnauthorizedException("You are not a participant in this conversation");
        }
        
        // Create message
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .read(false)
                .build();
        
        Message saved = messageRepository.save(message);
        
        // Update conversation last message timestamp
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        
        // Update unread count for recipients
        if (conversation.getCreator().getId().equals(senderId)) {
            conversationRepository.incrementBrandUnreadCount(conversationId);
        } else if (conversation.getBrand().getId().equals(senderId)) {
            conversationRepository.incrementCreatorUnreadCount(conversationId);
        } else if (isAdminSender) {
            conversationRepository.incrementCreatorUnreadCount(conversationId);
            conversationRepository.incrementBrandUnreadCount(conversationId);
        }
        
        // Convert to DTO
        MessageDTO messageDTO = toDTO(saved);
        
        // Broadcast to conversation topic
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, messageDTO);
        
        // Send to recipient queues
        if (isAdminSender) {
            messagingTemplate.convertAndSendToUser(
                    conversation.getCreator().getId(),
                    "/queue/messages",
                    messageDTO
            );
            messagingTemplate.convertAndSendToUser(
                    conversation.getBrand().getId(),
                    "/queue/messages",
                    messageDTO
            );
        } else {
            String recipientId = conversation.getCreator().getId().equals(senderId)
                    ? conversation.getBrand().getId()
                    : conversation.getCreator().getId();
            messagingTemplate.convertAndSendToUser(
                    recipientId,
                    "/queue/messages",
                    messageDTO
            );
        }
        
        log.info("Message sent: {} in conversation: {}", saved.getId(), conversationId);
        
        return messageDTO;
    }
    
    /**
     * Get messages for conversation with pagination
     */
    @Transactional(readOnly = true)
    public Page<MessageDTO> getMessages(String conversationId, int page, int size, String userId) {
        // Verify user is a participant
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
        
        if (!conversation.getCreator().getId().equals(userId) && 
            !conversation.getBrand().getId().equals(userId)) {
            throw new UnauthorizedException("You are not a participant in this conversation");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByConversationId(conversationId, pageable);
        
        return messages.map(this::toDTO);
    }

    /**
     * Get messages for conversation (admin access).
     */
    @Transactional(readOnly = true)
    public Page<MessageDTO> getMessagesForAdmin(String conversationId, int page, int size) {
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByConversationId(conversationId, pageable);
        return messages.map(this::toDTO);
    }

    /**
     * Send message as admin to any conversation.
     */
    @Transactional
    public MessageDTO sendAdminMessage(String conversationId, String adminId, String content) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Only admins can send as Team CreatorX");
        }
        return sendMessage(conversationId, adminId, content);
    }
    
    /**
     * Mark messages as read
     */
    @Transactional
    public void markAsRead(String conversationId, String userId) {
        // Verify user is a participant
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
        
        if (!conversation.getCreator().getId().equals(userId) && 
            !conversation.getBrand().getId().equals(userId)) {
            throw new UnauthorizedException("You are not a participant in this conversation");
        }
        
        // Mark messages as read
        int updated = messageRepository.markAsReadByConversationIdAndUserId(
                conversationId, userId, LocalDateTime.now()
        );
        
        // Reset unread count
        if (conversation.getCreator().getId().equals(userId)) {
            conversationRepository.resetCreatorUnreadCount(conversationId);
        } else {
            conversationRepository.resetBrandUnreadCount(conversationId);
        }
        
        // Broadcast read receipt
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/read",
                new ReadReceiptDTO(conversationId, userId, LocalDateTime.now())
        );
        
        log.info("Marked {} messages as read in conversation: {} by user: {}", updated, conversationId, userId);
    }
    
    /**
     * Get unread message count for user
     */
    @Transactional(readOnly = true)
    public int getUnreadCount(String userId) {
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        
        int totalUnread = 0;
        for (Conversation conversation : conversations) {
            if (conversation.getCreator().getId().equals(userId)) {
                totalUnread += conversation.getCreatorUnreadCount() != null ? conversation.getCreatorUnreadCount() : 0;
            } else {
                totalUnread += conversation.getBrandUnreadCount() != null ? conversation.getBrandUnreadCount() : 0;
            }
        }
        
        return totalUnread;
    }
    
    /**
     * Get conversations for user
     */
    @Transactional(readOnly = true)
    public List<ConversationDTO> getConversations(String userId) {
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        
        return conversations.stream()
                .map(conv -> toConversationDTO(conv, userId))
                .collect(Collectors.toList());
    }
    
    /**
     * Get or create conversation between creator and brand
     */
    @Transactional
    public Conversation getOrCreateConversation(String creatorId, String brandId, String campaignId) {
        // Try to find existing conversation
        return conversationRepository.findByCreatorAndBrandAndCampaign(creatorId, brandId, campaignId)
                .orElseGet(() -> {
                    // Create new conversation
                    User creator = userRepository.findById(creatorId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", creatorId));
                    User brand = userRepository.findById(brandId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", brandId));
                    
                    Conversation conversation = Conversation.builder()
                            .creator(creator)
                            .brand(brand)
                            .creatorUnreadCount(0)
                            .brandUnreadCount(0)
                            .build();
                    
                    if (campaignId != null) {
                        campaignRepository.findById(campaignId).ifPresent(conversation::setCampaign);
                    }
                    
                    Conversation saved = conversationRepository.save(conversation);
                    log.info("Created new conversation: {} between creator: {} and brand: {}", 
                            saved.getId(), creatorId, brandId);
                    
                    return saved;
                });
    }
    
    // Helper methods
    
    public MessageDTO toDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(getSenderName(message.getSender()))
                .senderAvatar(getSenderAvatar(message.getSender()))
                .content(message.getContent())
                .read(message.getRead())
                .createdAt(message.getCreatedAt())
                .readAt(message.getReadAt())
                .deliveryStatus("sent")
                .build();
    }
    
    private ConversationDTO toConversationDTO(Conversation conversation, String currentUserId) {
        // Get unread count for current user
        int unreadCount = conversation.getCreator().getId().equals(currentUserId)
                ? (conversation.getCreatorUnreadCount() != null ? conversation.getCreatorUnreadCount() : 0)
                : (conversation.getBrandUnreadCount() != null ? conversation.getBrandUnreadCount() : 0);
        
        // Get last message
        MessageDTO lastMessage = null;
        if (conversation.getLastMessageAt() != null) {
            List<Message> latestMessages = messageRepository.findLatestByConversationId(
                    conversation.getId(), PageRequest.of(0, 1)
            );
            if (!latestMessages.isEmpty()) {
                lastMessage = toDTO(latestMessages.get(0));
            }
        }
        
        return ConversationDTO.builder()
                .id(conversation.getId())
                .creatorId(conversation.getCreator().getId())
                .creatorName(getUserName(conversation.getCreator()))
                .brandId(conversation.getBrand().getId())
                .brandName(getUserName(conversation.getBrand()))
                .campaignId(conversation.getCampaign() != null ? conversation.getCampaign().getId() : null)
                .campaignTitle(conversation.getCampaign() != null ? conversation.getCampaign().getTitle() : null)
                .unreadCount(unreadCount)
                .lastMessageAt(conversation.getLastMessageAt())
                .lastMessage(lastMessage)
                .build();
    }
    
    private String getSenderName(User user) {
        if (user.getRole() == UserRole.ADMIN) {
            return "Team CreatorX";
        }
        if (user.getUserProfile() != null) {
            return user.getUserProfile().getFullName();
        }
        return user.getEmail();
    }
    
    private String getSenderAvatar(User user) {
        if (user.getUserProfile() != null) {
            return user.getUserProfile().getAvatarUrl();
        }
        return null;
    }
    
    private String getUserName(User user) {
        if (user.getUserProfile() != null) {
            return user.getUserProfile().getFullName();
        }
        return user.getEmail();
    }
    
    // Inner class for read receipt
    private static class ReadReceiptDTO {
        private String conversationId;
        private String userId;
        private LocalDateTime readAt;
        
        public ReadReceiptDTO(String conversationId, String userId, LocalDateTime readAt) {
            this.conversationId = conversationId;
            this.userId = userId;
            this.readAt = readAt;
        }
        
        // Getters
        public String getConversationId() { return conversationId; }
        public String getUserId() { return userId; }
        public LocalDateTime getReadAt() { return readAt; }
    }
}
