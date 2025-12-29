package com.creatorx.repository;

import com.creatorx.repository.entity.FCMToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface FCMTokenRepository extends JpaRepository<FCMToken, String> {
    
    @Query("SELECT f FROM FCMToken f WHERE f.user.id = :userId AND f.active = true")
    List<FCMToken> findActiveTokensByUserId(@Param("userId") String userId);
    
    @Query("SELECT f FROM FCMToken f WHERE f.user.id = :userId AND f.deviceId = :deviceId")
    Optional<FCMToken> findByUserIdAndDeviceId(@Param("userId") String userId, @Param("deviceId") String deviceId);
    
    @Query("SELECT f FROM FCMToken f WHERE f.fcmToken = :fcmToken")
    Optional<FCMToken> findByFcmToken(@Param("fcmToken") String fcmToken);
    
    @Modifying
    @Transactional
    @Query("UPDATE FCMToken f SET f.active = false WHERE f.user.id = :userId")
    int deactivateAllTokensForUser(@Param("userId") String userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE FCMToken f SET f.lastUsedAt = CURRENT_TIMESTAMP WHERE f.id = :tokenId")
    int updateLastUsedAt(@Param("tokenId") String tokenId);
}

