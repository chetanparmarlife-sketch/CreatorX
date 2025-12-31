package com.creatorx.service.admin;

import com.creatorx.repository.ConversationRepository;
import com.creatorx.repository.MessageRepository;
import com.creatorx.repository.entity.Conversation;
import com.creatorx.repository.entity.Message;
import com.creatorx.repository.entity.User;
import com.creatorx.service.MessageService;
import com.creatorx.service.dto.ConversationDTO;
import com.creatorx.service.dto.MessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminMessageService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final MessageService messageService;

    @Transactional(readOnly = true)
    public Page<ConversationDTO> listConversations(int page, int size) {
        Sort sort = Sort.by(Sort.Order.desc("lastMessageAt"), Sort.Order.desc("updatedAt"));
        Pageable pageable = PageRequest.of(page, size, sort);
        return conversationRepository.findAll(pageable)
                .map(this::toConversationDTO);
    }

    @Transactional(readOnly = true)
    public Page<MessageDTO> getMessages(String conversationId, int page, int size) {
        return messageService.getMessagesForAdmin(conversationId, page, size);
    }

    @Transactional
    public MessageDTO sendMessage(String conversationId, String adminId, String content) {
        return messageService.sendAdminMessage(conversationId, adminId, content);
    }

    private ConversationDTO toConversationDTO(Conversation conversation) {
        int unreadCount = (conversation.getCreatorUnreadCount() != null ? conversation.getCreatorUnreadCount() : 0) +
                (conversation.getBrandUnreadCount() != null ? conversation.getBrandUnreadCount() : 0);

        MessageDTO lastMessage = null;
        if (conversation.getLastMessageAt() != null) {
            List<Message> latestMessages = messageRepository.findLatestByConversationId(
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
        if (user == null) {
            return "Unknown";
        }
        if (user.getUserProfile() != null && user.getUserProfile().getFullName() != null) {
            return user.getUserProfile().getFullName();
        }
        return user.getEmail();
    }
}
