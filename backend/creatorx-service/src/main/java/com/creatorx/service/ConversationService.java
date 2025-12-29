package com.creatorx.service;

import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.ConversationRepository;
import com.creatorx.repository.MessageRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Application;
import com.creatorx.repository.entity.Conversation;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.ConversationDTO;
import com.creatorx.service.dto.MessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {
    
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final ApplicationRepository applicationRepository;
    private final MessageRepository messageRepository;
    private final MessageService messageService;
    
    /**
     * Create conversation between creator and brand (auto-created when application is SELECTED)
     */
    @Transactional
    public ConversationDTO createConversation(String campaignId, String creatorId, String brandId) {
        // Verify users exist
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", creatorId));
        User brand = userRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("User", brandId));
        
        // Check if conversation already exists
        return conversationRepository.findByCreatorAndBrandAndCampaign(creatorId, brandId, campaignId)
                .map(conv -> toConversationDTO(conv, creatorId))
                .orElseGet(() -> {
                    // Create new conversation
                    Conversation conversation = Conversation.builder()
                            .creator(creator)
                            .brand(brand)
                            .creatorUnreadCount(0)
                            .brandUnreadCount(0)
                            .build();
                    
                    if (campaignId != null) {
                        campaignRepository.findById(campaignId)
                                .ifPresent(conversation::setCampaign);
                    }
                    
                    Conversation saved = conversationRepository.save(conversation);
                    log.info("Created conversation: {} between creator: {} and brand: {} for campaign: {}", 
                            saved.getId(), creatorId, brandId, campaignId);
                    
                    return toConversationDTO(saved, creatorId);
                });
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
     * Get conversation by ID
     */
    @Transactional(readOnly = true)
    public ConversationDTO getConversationById(String id, String userId) {
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", id));
        
        // Verify user is a participant
        if (!conversation.getCreator().getId().equals(userId) && 
            !conversation.getBrand().getId().equals(userId)) {
            throw new UnauthorizedException("You are not a participant in this conversation");
        }
        
        return toConversationDTO(conversation, userId);
    }
    
    /**
     * Find conversation by application ID (created when application is SELECTED)
     */
    @Transactional(readOnly = true)
    public ConversationDTO findByApplicationId(String applicationId, String userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));
        
        // Verify user is creator or brand
        if (!application.getCreator().getId().equals(userId) && 
            !application.getCampaign().getBrand().getId().equals(userId)) {
            throw new UnauthorizedException("You are not authorized to access this conversation");
        }
        
        return conversationRepository.findByCampaignIdAndCreatorId(
                application.getCampaign().getId(),
                application.getCreator().getId()
        )
        .map(conv -> toConversationDTO(conv, userId))
        .orElseThrow(() -> new ResourceNotFoundException("Conversation", "for application: " + applicationId));
    }
    
    // Helper methods
    
    private ConversationDTO toConversationDTO(Conversation conversation, String currentUserId) {
        // Get unread count for current user
        int unreadCount = conversation.getCreator().getId().equals(currentUserId)
                ? (conversation.getCreatorUnreadCount() != null ? conversation.getCreatorUnreadCount() : 0)
                : (conversation.getBrandUnreadCount() != null ? conversation.getBrandUnreadCount() : 0);
        
        // Get last message
        MessageDTO lastMessage = null;
        if (conversation.getLastMessageAt() != null) {
            List<com.creatorx.repository.entity.Message> latestMessages = messageRepository.findLatestByConversationId(
                    conversation.getId(), PageRequest.of(0, 1)
            );
            if (!latestMessages.isEmpty()) {
                lastMessage = messageService.toDTO(latestMessages.get(0));
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
    
    private String getUserName(User user) {
        if (user.getUserProfile() != null) {
            return user.getUserProfile().getFullName();
        }
        return user.getEmail();
    }
}

