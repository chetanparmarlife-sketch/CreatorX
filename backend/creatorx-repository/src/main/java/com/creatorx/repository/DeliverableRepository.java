package com.creatorx.repository;

import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.repository.entity.DeliverableSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliverableRepository extends JpaRepository<DeliverableSubmission, String> {
    // Find deliverables by creator (through application)
    @EntityGraph(attributePaths = {
           "application", "application.creator", "application.creator.userProfile", "application.creator.creatorProfile",
           "application.campaign", "application.campaign.brand", "campaignDeliverable", "review"
    })
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE ds.application.creator.id = :creatorId ORDER BY ds.submittedAt DESC")
    Page<DeliverableSubmission> findByCreatorId(@Param("creatorId") String creatorId, Pageable pageable);
    
    @EntityGraph(attributePaths = {
           "application", "application.creator", "application.creator.userProfile", "application.creator.creatorProfile",
           "application.campaign", "application.campaign.brand", "campaignDeliverable", "review"
    })
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE ds.application.creator.id = :creatorId AND ds.status = :status ORDER BY ds.submittedAt DESC")
    Page<DeliverableSubmission> findByCreatorIdAndStatus(
        @Param("creatorId") String creatorId,
        @Param("status") SubmissionStatus status,
        Pageable pageable
    );
    
    // Find deliverables for brand (through campaign) - all statuses
    @EntityGraph(attributePaths = {
           "application", "application.creator", "application.creator.userProfile", "application.creator.creatorProfile",
           "application.campaign", "application.campaign.brand", "campaignDeliverable", "review"
    })
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE " +
           "ds.application.campaign.brand.id = :brandId " +
           "ORDER BY ds.submittedAt DESC")
    Page<DeliverableSubmission> findDeliverablesForBrand(@Param("brandId") String brandId, Pageable pageable);

    @EntityGraph(attributePaths = {
           "application", "application.creator", "application.creator.userProfile", "application.creator.creatorProfile",
           "application.campaign", "application.campaign.brand", "campaignDeliverable", "review"
    })
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE " +
           "ds.application.campaign.brand.id = :brandId AND " +
           "ds.status = :status " +
           "ORDER BY ds.submittedAt DESC")
    Page<DeliverableSubmission> findDeliverablesForBrandAndStatus(
        @Param("brandId") String brandId,
        @Param("status") SubmissionStatus status,
        Pageable pageable
    );
    
    // Find pending deliverables for brand (through campaign)
    @EntityGraph(attributePaths = {
           "application", "application.creator", "application.creator.userProfile", "application.creator.creatorProfile",
           "application.campaign", "application.campaign.brand", "campaignDeliverable", "review"
    })
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE " +
           "ds.application.campaign.brand.id = :brandId AND " +
           "ds.status = 'PENDING' " +
           "ORDER BY ds.submittedAt ASC")
    Page<DeliverableSubmission> findPendingDeliverablesForBrand(@Param("brandId") String brandId, Pageable pageable);
    
    // Find deliverables by application
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE ds.application.id = :applicationId ORDER BY ds.submittedAt DESC")
    List<DeliverableSubmission> findByApplicationId(@Param("applicationId") String applicationId);

    @EntityGraph(attributePaths = {
           "application", "application.creator", "application.creator.userProfile", "application.creator.creatorProfile",
           "application.campaign", "application.campaign.brand", "campaignDeliverable", "review"
    })
    @Query(value = "SELECT ds FROM DeliverableSubmission ds WHERE ds.application.id = :applicationId ORDER BY ds.submittedAt DESC",
           countQuery = "SELECT COUNT(ds) FROM DeliverableSubmission ds WHERE ds.application.id = :applicationId")
    Page<DeliverableSubmission> findPageByApplicationId(
        @Param("applicationId") String applicationId,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {
           "application", "application.creator", "application.creator.userProfile", "application.creator.creatorProfile",
           "application.campaign", "application.campaign.brand", "campaignDeliverable", "review"
    })
    @Query(value = "SELECT ds FROM DeliverableSubmission ds WHERE ds.application.id = :applicationId AND ds.status = :status ORDER BY ds.submittedAt DESC",
           countQuery = "SELECT COUNT(ds) FROM DeliverableSubmission ds WHERE ds.application.id = :applicationId AND ds.status = :status")
    Page<DeliverableSubmission> findPageByApplicationIdAndStatus(
        @Param("applicationId") String applicationId,
        @Param("status") SubmissionStatus status,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {
           "application", "application.creator", "application.creator.userProfile", "application.creator.creatorProfile",
           "application.campaign", "application.campaign.brand", "campaignDeliverable", "review"
    })
    @Query(value = "SELECT ds FROM DeliverableSubmission ds WHERE ds.application.campaign.id = :campaignId ORDER BY ds.submittedAt DESC",
           countQuery = "SELECT COUNT(ds) FROM DeliverableSubmission ds WHERE ds.application.campaign.id = :campaignId")
    Page<DeliverableSubmission> findPageByCampaignId(
        @Param("campaignId") String campaignId,
        Pageable pageable
    );

    @EntityGraph(attributePaths = {
           "application", "application.creator", "application.creator.userProfile", "application.creator.creatorProfile",
           "application.campaign", "application.campaign.brand", "campaignDeliverable", "review"
    })
    @Query(value = "SELECT ds FROM DeliverableSubmission ds WHERE ds.application.campaign.id = :campaignId AND ds.status = :status ORDER BY ds.submittedAt DESC",
           countQuery = "SELECT COUNT(ds) FROM DeliverableSubmission ds WHERE ds.application.campaign.id = :campaignId AND ds.status = :status")
    Page<DeliverableSubmission> findPageByCampaignIdAndStatus(
        @Param("campaignId") String campaignId,
        @Param("status") SubmissionStatus status,
        Pageable pageable
    );
    
    // Count deliverables by application
    @Query("SELECT COUNT(ds) FROM DeliverableSubmission ds WHERE ds.application.id = :applicationId")
    long countByApplicationId(@Param("applicationId") String applicationId);
    
    @Query("SELECT COUNT(ds) FROM DeliverableSubmission ds WHERE ds.application.id = :applicationId AND ds.status = :status")
    long countByApplicationIdAndStatus(@Param("applicationId") String applicationId, @Param("status") SubmissionStatus status);

    @Query("SELECT COUNT(ds) FROM DeliverableSubmission ds WHERE ds.application.campaign.id = :campaignId AND ds.status = :status")
    long countByCampaignIdAndStatus(@Param("campaignId") String campaignId, @Param("status") SubmissionStatus status);
    
    // Find deliverables by campaign deliverable
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE ds.campaignDeliverable.id = :campaignDeliverableId")
    List<DeliverableSubmission> findByCampaignDeliverableId(@Param("campaignDeliverableId") String campaignDeliverableId);
    
    // Find deliverables by application and campaign deliverable (for version tracking)
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE " +
           "ds.application.id = :applicationId AND ds.campaignDeliverable.id = :campaignDeliverableId " +
           "ORDER BY ds.submittedAt DESC")
    List<DeliverableSubmission> findByApplicationIdAndCampaignDeliverableId(
        @Param("applicationId") String applicationId,
        @Param("campaignDeliverableId") String campaignDeliverableId
    );

    @EntityGraph(attributePaths = {
           "application", "application.creator", "application.creator.userProfile", "application.creator.creatorProfile",
           "application.campaign", "application.campaign.brand", "campaignDeliverable", "review"
    })
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE " +
           "(:brandId IS NULL OR ds.application.campaign.brand.id = :brandId) AND " +
           "(:campaignId IS NULL OR ds.application.campaign.id = :campaignId) AND " +
           "(:status IS NULL OR ds.status = :status) " +
           "ORDER BY ds.submittedAt DESC")
    Page<DeliverableSubmission> findAdminDeliverables(
        @Param("brandId") String brandId,
        @Param("campaignId") String campaignId,
        @Param("status") SubmissionStatus status,
        Pageable pageable
    );
    
    // Find latest deliverable submission for application and campaign deliverable
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE " +
           "ds.application.id = :applicationId AND ds.campaignDeliverable.id = :campaignDeliverableId " +
           "ORDER BY ds.submittedAt DESC")
    Page<DeliverableSubmission> findLatestByApplicationIdAndCampaignDeliverableId(
        @Param("applicationId") String applicationId,
        @Param("campaignDeliverableId") String campaignDeliverableId,
        Pageable pageable
    );
    
    // Count submissions for application and campaign deliverable (for version number)
    @Query("SELECT COUNT(ds) FROM DeliverableSubmission ds WHERE " +
           "ds.application.id = :applicationId AND ds.campaignDeliverable.id = :campaignDeliverableId")
    long countByApplicationIdAndCampaignDeliverableId(
        @Param("applicationId") String applicationId,
        @Param("campaignDeliverableId") String campaignDeliverableId
    );
}
