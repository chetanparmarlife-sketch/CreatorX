package com.creatorx.repository;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.repository.entity.Application;
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
public interface ApplicationRepository extends JpaRepository<Application, String> {
    // Find applications by creator (JOIN FETCH campaign to avoid N+1)
    @EntityGraph(attributePaths = {
            "creator", "creator.creatorProfile", "creator.userProfile",
            "campaign", "campaign.brand", "campaign.brand.brandProfile", "campaign.brand.userProfile", "feedback"
    })
    @Query(value = "SELECT a FROM Application a JOIN FETCH a.campaign WHERE a.creator.id = :creatorId ORDER BY a.appliedAt DESC",
           countQuery = "SELECT COUNT(a) FROM Application a WHERE a.creator.id = :creatorId")
    Page<Application> findByCreatorId(@Param("creatorId") String creatorId, Pageable pageable);

    @EntityGraph(attributePaths = {
            "creator", "creator.creatorProfile", "creator.userProfile",
            "campaign", "campaign.brand", "campaign.brand.brandProfile", "campaign.brand.userProfile", "feedback"
    })
    @Query(value = "SELECT a FROM Application a JOIN FETCH a.campaign WHERE a.creator.id = :creatorId AND a.status = :status ORDER BY a.appliedAt DESC",
           countQuery = "SELECT COUNT(a) FROM Application a WHERE a.creator.id = :creatorId AND a.status = :status")
    Page<Application> findByCreatorIdAndStatus(@Param("creatorId") String creatorId, @Param("status") ApplicationStatus status, Pageable pageable);

    // Find applications by campaign (JOIN FETCH campaign to avoid N+1)
    @Query("SELECT a FROM Application a JOIN FETCH a.campaign WHERE a.campaign.id = :campaignId ORDER BY a.appliedAt DESC")
    List<Application> findByCampaignId(@Param("campaignId") String campaignId);

    @EntityGraph(attributePaths = {
            "creator", "creator.creatorProfile", "creator.userProfile",
            "campaign", "campaign.brand", "campaign.brand.brandProfile", "campaign.brand.userProfile", "feedback"
    })
    @Query(value = "SELECT a FROM Application a WHERE a.campaign.id = :campaignId ORDER BY a.appliedAt DESC",
           countQuery = "SELECT COUNT(a) FROM Application a WHERE a.campaign.id = :campaignId")
    Page<Application> findPageByCampaignId(@Param("campaignId") String campaignId, Pageable pageable);
    
    @EntityGraph(attributePaths = {
            "creator", "creator.creatorProfile", "creator.userProfile",
            "campaign", "campaign.brand", "campaign.brand.brandProfile", "campaign.brand.userProfile", "feedback"
    })
    @Query("SELECT a FROM Application a WHERE a.campaign.id = :campaignId AND a.status = :status ORDER BY a.appliedAt DESC")
    Page<Application> findByCampaignIdAndStatus(
        @Param("campaignId") String campaignId,
        @Param("status") ApplicationStatus status,
        Pageable pageable
    );
    
    // Find pending applications for brand (JOIN FETCH campaign to avoid N+1)
    @EntityGraph(attributePaths = {
            "creator", "creator.creatorProfile", "creator.userProfile",
            "campaign", "campaign.brand", "campaign.brand.brandProfile", "campaign.brand.userProfile", "feedback"
    })
    @Query(value = "SELECT a FROM Application a JOIN FETCH a.campaign c WHERE c.brand.id = :brandId AND a.status = 'APPLIED' ORDER BY a.appliedAt DESC",
           countQuery = "SELECT COUNT(a) FROM Application a WHERE a.campaign.brand.id = :brandId AND a.status = 'APPLIED'")
    Page<Application> findPendingApplicationsForBrand(@Param("brandId") String brandId, Pageable pageable);

    // Find all applications for brand (JOIN FETCH campaign to avoid N+1)
    @EntityGraph(attributePaths = {
            "creator", "creator.creatorProfile", "creator.userProfile",
            "campaign", "campaign.brand", "campaign.brand.brandProfile", "campaign.brand.userProfile", "feedback"
    })
    @Query(value = "SELECT a FROM Application a JOIN FETCH a.campaign c WHERE c.brand.id = :brandId ORDER BY a.appliedAt DESC",
           countQuery = "SELECT COUNT(a) FROM Application a WHERE a.campaign.brand.id = :brandId")
    Page<Application> findAllApplicationsForBrand(@Param("brandId") String brandId, Pageable pageable);

    @EntityGraph(attributePaths = {
            "creator", "creator.creatorProfile", "creator.userProfile",
            "campaign", "campaign.brand", "campaign.brand.brandProfile", "campaign.brand.userProfile", "feedback"
    })
    @Query(value = "SELECT a FROM Application a JOIN FETCH a.campaign c WHERE " +
           "(:brandId IS NULL OR c.brand.id = :brandId) AND " +
           "(:campaignId IS NULL OR c.id = :campaignId) AND " +
           "(:status IS NULL OR a.status = :status) " +
           "ORDER BY a.appliedAt DESC",
           countQuery = "SELECT COUNT(a) FROM Application a WHERE " +
           "(:brandId IS NULL OR a.campaign.brand.id = :brandId) AND " +
           "(:campaignId IS NULL OR a.campaign.id = :campaignId) AND " +
           "(:status IS NULL OR a.status = :status)")
    Page<Application> findAdminApplications(
        @Param("brandId") String brandId,
        @Param("campaignId") String campaignId,
        @Param("status") ApplicationStatus status,
        Pageable pageable
    );
    
    // Count applications by campaign and status
    @Query("SELECT COUNT(a) FROM Application a WHERE a.campaign.id = :campaignId AND a.status = :status")
    long countByCampaignIdAndStatus(@Param("campaignId") String campaignId, @Param("status") ApplicationStatus status);
    
    @Query("SELECT COUNT(a) FROM Application a WHERE a.campaign.id = :campaignId")
    long countByCampaignId(@Param("campaignId") String campaignId);
    
    // Check if creator has already applied
    @Query("SELECT COUNT(a) > 0 FROM Application a WHERE a.campaign.id = :campaignId AND a.creator.id = :creatorId")
    boolean existsByCampaignIdAndCreatorId(@Param("campaignId") String campaignId, @Param("creatorId") String creatorId);
    
    // Find specific application
    @Query("SELECT a FROM Application a WHERE a.campaign.id = :campaignId AND a.creator.id = :creatorId")
    Optional<Application> findByCampaignIdAndCreatorId(@Param("campaignId") String campaignId, @Param("creatorId") String creatorId);
    
    // Count active applications (not WITHDRAWN or REJECTED) for a creator
    @Query("SELECT COUNT(a) FROM Application a WHERE a.creator.id = :creatorId AND a.status NOT IN ('WITHDRAWN', 'REJECTED')")
    long countActiveApplicationsByCreatorId(@Param("creatorId") String creatorId);

    @Query("SELECT a.creator.id, COUNT(a) FROM Application a WHERE a.creator.id IN :creatorIds GROUP BY a.creator.id")
    List<Object[]> countByCreatorIds(@Param("creatorIds") List<String> creatorIds);

    @Query("SELECT a.creator.id, COUNT(a) FROM Application a WHERE a.creator.id IN :creatorIds AND a.status = :status GROUP BY a.creator.id")
    List<Object[]> countByCreatorIdsAndStatus(
        @Param("creatorIds") List<String> creatorIds,
        @Param("status") ApplicationStatus status
    );
    
    // Find applications by user ID (alias for findByCreatorId - used by ComplianceService)
    @EntityGraph(attributePaths = {
            "creator", "creator.creatorProfile", "creator.userProfile",
            "campaign", "campaign.brand", "campaign.brand.brandProfile", "campaign.brand.userProfile", "feedback"
    })
    @Query(value = "SELECT a FROM Application a JOIN FETCH a.campaign WHERE a.creator.id = :userId ORDER BY a.appliedAt DESC",
           countQuery = "SELECT COUNT(a) FROM Application a WHERE a.creator.id = :userId")
    Page<Application> findByUserId(@Param("userId") String userId, Pageable pageable);
}
