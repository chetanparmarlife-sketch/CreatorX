package com.creatorx.repository;

import com.creatorx.repository.entity.CreatorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, String> {
    
    @Query("SELECT c FROM CreatorProfile c WHERE c.username = :username")
    Optional<CreatorProfile> findByUsername(@Param("username") String username);
    
    @Query("SELECT COUNT(c) > 0 FROM CreatorProfile c WHERE c.username = :username AND c.userId != :userId")
    boolean existsByUsernameAndUserIdNot(@Param("username") String username, @Param("userId") String userId);
}

