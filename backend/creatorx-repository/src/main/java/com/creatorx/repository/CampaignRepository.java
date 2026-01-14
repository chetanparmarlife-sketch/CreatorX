package com.creatorx.repository;

import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.repository.entity.Campaign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, String> {
    // Basic queries
    Page<Campaign> findByStatus(CampaignStatus status, Pageable pageable);
    Page<Campaign> findByCategory(String category, Pageable pageable);
    
    // Find campaigns by brand
    @Query("SELECT c FROM Campaign c WHERE c.brand.id = :brandId")
    Page<Campaign> findByBrandId(@Param("brandId") String brandId, Pageable pageable);
    
    @Query("SELECT c FROM Campaign c WHERE c.brand.id = :brandId AND c.status = :status")
    Page<Campaign> findByBrandIdAndStatus(@Param("brandId") String brandId, @Param("status") CampaignStatus status, Pageable pageable);
    
    // Find active campaigns by filters
    @Query("SELECT c FROM Campaign c WHERE c.status = 'ACTIVE' AND " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:platform IS NULL OR c.platform = :platform) AND " +
           "(:minBudget IS NULL OR c.budget >= :minBudget) AND " +
           "(:maxBudget IS NULL OR c.budget <= :maxBudget)")
    Page<Campaign> findActiveCampaignsByFilters(
        @Param("category") String category,
        @Param("platform") CampaignPlatform platform,
        @Param("minBudget") BigDecimal minBudget,
        @Param("maxBudget") BigDecimal maxBudget,
        Pageable pageable
    );
    
    // Full-text search using PostgreSQL tsvector (native query for better performance)
    // Note: Using string comparison instead of CAST to work with both Hibernate enums and test DDL
    @Query(value = "SELECT * FROM campaigns c WHERE " +
           "c.status = :status AND " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:platform IS NULL OR c.platform = :platform) AND " +
           "(:minBudget IS NULL OR c.budget >= :minBudget) AND " +
           "(:maxBudget IS NULL OR c.budget <= :maxBudget) AND " +
           "(:search IS NULL OR to_tsvector('english', coalesce(c.title, '') || ' ' || coalesce(c.description, '')) @@ plainto_tsquery('english', :search)) " +
           "ORDER BY CASE WHEN :search IS NULL THEN c.created_at ELSE ts_rank(to_tsvector('english', coalesce(c.title, '') || ' ' || coalesce(c.description, '')), plainto_tsquery('english', :search)) END DESC",
           nativeQuery = true)
    Page<Campaign> searchCampaignsWithFullText(
        @Param("status") String status,
        @Param("category") String category,
        @Param("platform") String platform,
        @Param("minBudget") BigDecimal minBudget,
        @Param("maxBudget") BigDecimal maxBudget,
        @Param("search") String search,
        Pageable pageable
    );
    
    // Simple search by title/description (JPQL fallback)
    @Query("SELECT c FROM Campaign c WHERE c.status = :status AND " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Campaign> searchCampaigns(
        @Param("status") CampaignStatus status,
        @Param("category") String category,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT c FROM Campaign c WHERE " +
           "(:brandId IS NULL OR c.brand.id = :brandId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:platform IS NULL OR c.platform = :platform) AND " +
           "(:minBudget IS NULL OR c.budget >= :minBudget) AND " +
           "(:maxBudget IS NULL OR c.budget <= :maxBudget) AND " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Campaign> findAdminCampaigns(
        @Param("brandId") String brandId,
        @Param("status") CampaignStatus status,
        @Param("category") String category,
        @Param("platform") CampaignPlatform platform,
        @Param("minBudget") BigDecimal minBudget,
        @Param("maxBudget") BigDecimal maxBudget,
        @Param("search") String search,
        Pageable pageable
    );
    
    // Count campaigns by status
    long countByStatus(CampaignStatus status);
    
    @Query("SELECT COUNT(c) FROM Campaign c WHERE c.brand.id = :brandId AND c.status = :status")
    long countByBrandIdAndStatus(@Param("brandId") String brandId, @Param("status") CampaignStatus status);
}



