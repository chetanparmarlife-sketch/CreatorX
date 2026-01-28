package com.creatorx.repository;

import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);

    Optional<User> findBySupabaseId(String supabaseId);

    // Note: User entity does not have 'username' field - use
    // CreatorProfileRepository.findByUsername() instead
    boolean existsByEmail(String email);

    Optional<User> findByReferralCode(String referralCode);

    Optional<User> findFirstByRoleOrderByCreatedAtAsc(UserRole role);

    long countByRole(UserRole role);

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}
