package com.creatorx.repository;

import com.creatorx.common.enums.SocialProvider;
import com.creatorx.common.enums.SocialSyncStatus;
import com.creatorx.repository.entity.SocialAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SocialAccountRepository extends JpaRepository<SocialAccount, String> {
    List<SocialAccount> findAllByUser_Id(String userId);
    
    // Alias for service layer compatibility
    default List<SocialAccount> findAllByUserId(String userId) {
        return findAllByUser_Id(userId);
    }

    Optional<SocialAccount> findByUser_IdAndProvider(String userId, SocialProvider provider);
    
    // Alias for service layer compatibility
    default Optional<SocialAccount> findByUserIdAndProvider(String userId, SocialProvider provider) {
        return findByUser_IdAndProvider(userId, provider);
    }

    @Query("""
        SELECT account
        FROM SocialAccount account
        WHERE account.connected = true
          AND account.syncStatus = :status
          AND (account.lastSyncedAt IS NULL OR account.lastSyncedAt < :cutoff)
        """)
    List<SocialAccount> findRefreshCandidates(
            @Param("status") SocialSyncStatus status,
            @Param("cutoff") LocalDateTime cutoff
    );
}
