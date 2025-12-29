package com.creatorx.repository;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.repository.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String> {
    // Find applications by creator
    @Query("SELECT a FROM Application a WHERE a.creator.id = :creatorId ORDER BY a.appliedAt DESC")
    Page<Application> findByCreatorId(@Param("creatorId") String creatorId, Pageable pageable);
    
    @Query("SELECT a FROM Application a WHERE a.creator.id = :creatorId AND a.status = :status ORDER BY a.appliedAt DESC")
    Page<Application> findByCreatorIdAndStatus(@Param("creatorId") String creatorId, @Param("status") ApplicationStatus status, Pageable pageable);
    
    // Find applications by campaign
    @Query("SELECT a FROM Application a WHERE a.campaign.id = :campaignId ORDER BY a.appliedAt DESC")
    List<Application> findByCampaignId(@Param("campaignId") String campaignId);
    
    @Query("SELECT a FROM Application a WHERE a.campaign.id = :campaignId AND a.status = :status ORDER BY a.appliedAt DESC")
    Page<Application> findByCampaignIdAndStatus(
        @Param("campaignId") String campaignId,
        @Param("status") ApplicationStatus status,
        Pageable pageable
    );
    
    // Find pending applications for brand (campaigns owned by brand)
    @Query("SELECT a FROM Application a WHERE a.campaign.brand.id = :brandId AND a.status = 'APPLIED' ORDER BY a.appliedAt DESC")
    Page<Application> findPendingApplicationsForBrand(@Param("brandId") String brandId, Pageable pageable);
    
    // Find all applications for brand (campaigns owned by brand) - all statuses
    @Query("SELECT a FROM Application a WHERE a.campaign.brand.id = :brandId ORDER BY a.appliedAt DESC")
    Page<Application> findAllApplicationsForBrand(@Param("brandId") String brandId, Pageable pageable);
    
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
}

