package com.creatorx.repository;

import com.creatorx.repository.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    // Find conversations by creator or brand
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.creator.id = :userId OR c.brand.id = :userId) " +
           "ORDER BY c.lastMessageAt DESC NULLS LAST, c.updatedAt DESC")
    List<Conversation> findByUserId(@Param("userId") String userId);
    
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.creator.id = :userId OR c.brand.id = :userId) " +
           "ORDER BY c.lastMessageAt DESC NULLS LAST, c.updatedAt DESC")
    Page<Conversation> findByUserId(@Param("userId") String userId, Pageable pageable);
    
    // Find conversations by creator
    @Query("SELECT c FROM Conversation c WHERE c.creator.id = :creatorId ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<Conversation> findByCreatorId(@Param("creatorId") String creatorId);
    
    // Find conversations by brand
    @Query("SELECT c FROM Conversation c WHERE c.brand.id = :brandId ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<Conversation> findByBrandId(@Param("brandId") String brandId);
    
    // Find conversation by participants
    @Query("SELECT c FROM Conversation c WHERE " +
           "((c.creator.id = :userId1 AND c.brand.id = :userId2) OR " +
           "(c.creator.id = :userId2 AND c.brand.id = :userId1))")
    Optional<Conversation> findByParticipants(@Param("userId1") String userId1, @Param("userId2") String userId2);
    
    // Find conversation by campaign and creator
    @Query("SELECT c FROM Conversation c WHERE " +
           "c.campaign.id = :campaignId AND c.creator.id = :creatorId")
    Optional<Conversation> findByCampaignIdAndCreatorId(
        @Param("campaignId") String campaignId,
        @Param("creatorId") String creatorId
    );
    
    // Find conversation by campaign, creator, and brand
    @Query("SELECT c FROM Conversation c WHERE " +
           "c.creator.id = :creatorId AND c.brand.id = :brandId " +
           "AND (:campaignId IS NULL OR c.campaign.id = :campaignId)")
    Optional<Conversation> findByCreatorAndBrandAndCampaign(
        @Param("creatorId") String creatorId,
        @Param("brandId") String brandId,
        @Param("campaignId") String campaignId
    );
    
    // Update last message timestamp
    @Modifying
    @Transactional
    @Query("UPDATE Conversation c SET c.lastMessageAt = :lastMessageAt WHERE c.id = :conversationId")
    int updateLastMessageAt(@Param("conversationId") String conversationId, @Param("lastMessageAt") LocalDateTime lastMessageAt);
    
    // Update unread counts
    @Modifying
    @Transactional
    @Query("UPDATE Conversation c SET c.creatorUnreadCount = c.creatorUnreadCount + 1 WHERE c.id = :conversationId")
    int incrementCreatorUnreadCount(@Param("conversationId") String conversationId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Conversation c SET c.brandUnreadCount = c.brandUnreadCount + 1 WHERE c.id = :conversationId")
    int incrementBrandUnreadCount(@Param("conversationId") String conversationId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Conversation c SET c.creatorUnreadCount = 0 WHERE c.id = :conversationId")
    int resetCreatorUnreadCount(@Param("conversationId") String conversationId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Conversation c SET c.brandUnreadCount = 0 WHERE c.id = :conversationId")
    int resetBrandUnreadCount(@Param("conversationId") String conversationId);
}


