package com.creatorx.repository;

import com.creatorx.repository.entity.MediaKit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for MediaKit entity
 */
@Repository
public interface MediaKitRepository extends JpaRepository<MediaKit, String> {

    /**
     * Find media kit by user ID
     */
    Optional<MediaKit> findByUserId(String userId);

    /**
     * Find public media kit by user ID
     */
    @Query("SELECT m FROM MediaKit m WHERE m.userId = :userId AND m.isPublic = true")
    Optional<MediaKit> findPublicByUserId(@Param("userId") String userId);

    /**
     * Check if user has a media kit
     */
    boolean existsByUserId(String userId);

    /**
     * Find all public media kits
     */
    List<MediaKit> findByIsPublicTrue();

    /**
     * Find public media kits by category
     */
    @Query("SELECT m FROM MediaKit m WHERE m.isPublic = true AND m.primaryCategory = :category")
    List<MediaKit> findPublicByCategory(@Param("category") String category);

    /**
     * Delete media kit by user ID
     */
    void deleteByUserId(String userId);
}
