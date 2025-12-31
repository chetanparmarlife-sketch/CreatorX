package com.creatorx.repository;

import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.repository.entity.DeliverableSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliverableRepository extends JpaRepository<DeliverableSubmission, String> {
    // Find deliverables by creator (through application)
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE ds.application.creator.id = :creatorId ORDER BY ds.submittedAt DESC")
    Page<DeliverableSubmission> findByCreatorId(@Param("creatorId") String creatorId, Pageable pageable);
    
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE ds.application.creator.id = :creatorId AND ds.status = :status ORDER BY ds.submittedAt DESC")
    Page<DeliverableSubmission> findByCreatorIdAndStatus(
        @Param("creatorId") String creatorId,
        @Param("status") SubmissionStatus status,
        Pageable pageable
    );
    
    // Find deliverables for brand (through campaign) - all statuses
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE " +
           "ds.application.campaign.brand.id = :brandId " +
           "ORDER BY ds.submittedAt DESC")
    Page<DeliverableSubmission> findDeliverablesForBrand(@Param("brandId") String brandId, Pageable pageable);
    
    // Find pending deliverables for brand (through campaign)
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE " +
           "ds.application.campaign.brand.id = :brandId AND " +
           "ds.status = 'PENDING' " +
           "ORDER BY ds.submittedAt ASC")
    Page<DeliverableSubmission> findPendingDeliverablesForBrand(@Param("brandId") String brandId, Pageable pageable);
    
    // Find deliverables by application
    @Query("SELECT ds FROM DeliverableSubmission ds WHERE ds.application.id = :applicationId ORDER BY ds.submittedAt DESC")
    List<DeliverableSubmission> findByApplicationId(@Param("applicationId") String applicationId);
    
    // Count deliverables by application
    @Query("SELECT COUNT(ds) FROM DeliverableSubmission ds WHERE ds.application.id = :applicationId")
    long countByApplicationId(@Param("applicationId") String applicationId);
    
    @Query("SELECT COUNT(ds) FROM DeliverableSubmission ds WHERE ds.application.id = :applicationId AND ds.status = :status")
    long countByApplicationIdAndStatus(@Param("applicationId") String applicationId, @Param("status") SubmissionStatus status);
    
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
