package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private String id;
    private String creatorId;
    private String creatorName;
    private String brandId;
    private String brandName;
    private String campaignId;
    private String campaignTitle;
    private Integer unreadCount;
    private LocalDateTime lastMessageAt;
    private MessageDTO lastMessage;
    private List<MessageDTO> messages;
}

