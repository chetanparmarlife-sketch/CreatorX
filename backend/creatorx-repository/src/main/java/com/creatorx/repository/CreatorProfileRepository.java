package com.creatorx.repository;

import com.creatorx.repository.entity.CreatorProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, String> {

    @Query("SELECT c FROM CreatorProfile c WHERE c.username = :username")
    Optional<CreatorProfile> findByUsername(@Param("username") String username);

    @Query("SELECT COUNT(c) > 0 FROM CreatorProfile c WHERE c.username = :username AND c.userId != :userId")
    boolean existsByUsernameAndUserIdNot(@Param("username") String username, @Param("userId") String userId);

    @EntityGraph(attributePaths = {"user", "user.userProfile"})
    @Query("SELECT c FROM CreatorProfile c WHERE " +
           "(:search IS NULL OR LOWER(c.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.category) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.user.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoriesEmpty = TRUE OR c.category IN :categories) AND " +
           "(:platform IS NULL OR " +
           "(:platform = 'INSTAGRAM' AND c.instagramUrl IS NOT NULL) OR " +
           "(:platform = 'YOUTUBE' AND c.youtubeUrl IS NOT NULL) OR " +
           "(:platform = 'TIKTOK' AND c.tiktokUrl IS NOT NULL) OR " +
           "(:platform = 'TWITTER' AND c.twitterUrl IS NOT NULL)) AND " +
           "(:minFollowers IS NULL OR c.followerCount >= :minFollowers) AND " +
           "(:maxFollowers IS NULL OR c.followerCount <= :maxFollowers)")
    Page<CreatorProfile> searchCreators(
            @Param("search") String search,
            @Param("categories") List<String> categories,
            @Param("categoriesEmpty") boolean categoriesEmpty,
            @Param("platform") String platform,
            @Param("minFollowers") Integer minFollowers,
            @Param("maxFollowers") Integer maxFollowers,
            Pageable pageable);

    List<CreatorProfile> findAllByUserIdIn(List<String> userIds);
}
