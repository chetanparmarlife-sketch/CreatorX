package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_messages_conversation_id", columnList = "conversation_id"),
    @Index(name = "idx_messages_sender_id", columnList = "sender_id"),
    @Index(name = "idx_messages_created_at", columnList = "created_at"),
    @Index(name = "idx_messages_read", columnList = "conversation_id,read"),
    @Index(name = "idx_messages_conversation_created", columnList = "conversation_id,created_at")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"conversation", "sender"})
public class Message extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Builder.Default
    private Boolean read = false;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
}




