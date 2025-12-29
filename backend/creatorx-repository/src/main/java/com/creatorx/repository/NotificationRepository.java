package com.creatorx.repository;

import com.creatorx.repository.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    // Find notifications by user
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    Page<Notification> findByUserId(@Param("userId") String userId, Pageable pageable);
    
    // Find unread notifications by user
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.read = false ORDER BY n.createdAt DESC")
    Page<Notification> findUnreadByUserId(@Param("userId") String userId, Pageable pageable);
    
    // Count unread notifications by user
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.read = false")
    long countUnreadByUserId(@Param("userId") String userId);
    
    // Mark all notifications as read for user
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.user.id = :userId AND n.read = false")
    int markAllReadForUser(@Param("userId") String userId, @Param("readAt") LocalDateTime readAt);
    
    // Mark single notification as read
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.id = :notificationId AND n.user.id = :userId AND n.read = false")
    int markAsRead(@Param("notificationId") String notificationId, @Param("userId") String userId, @Param("readAt") LocalDateTime readAt);
    
    // Find notifications by user and read status
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.read = :read ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdAndRead(@Param("userId") String userId, @Param("read") Boolean read, Pageable pageable);
}





