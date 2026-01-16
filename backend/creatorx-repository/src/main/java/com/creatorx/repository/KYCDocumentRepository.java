package com.creatorx.repository;

import com.creatorx.common.enums.DocumentStatus;
import com.creatorx.common.enums.DocumentType;
import com.creatorx.repository.entity.KYCDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KYCDocumentRepository extends JpaRepository<KYCDocument, String> {

        @Query("SELECT k FROM KYCDocument k WHERE k.user.id = :userId ORDER BY k.createdAt DESC")
        List<KYCDocument> findByUserId(@Param("userId") String userId);

        @Query("SELECT k FROM KYCDocument k WHERE k.user.id = :userId AND k.documentType = :documentType ORDER BY k.createdAt DESC")
        List<KYCDocument> findByUserIdAndDocumentType(@Param("userId") String userId,
                        @Param("documentType") DocumentType documentType);

        @Query("SELECT k FROM KYCDocument k WHERE k.user.id = :userId AND k.status = :status ORDER BY k.createdAt DESC")
        List<KYCDocument> findByUserIdAndStatus(@Param("userId") String userId, @Param("status") DocumentStatus status);

        @Query("SELECT COUNT(k) FROM KYCDocument k WHERE k.user.id = :userId AND k.status = 'APPROVED'")
        long countApprovedByUserId(@Param("userId") String userId);

        @Query("SELECT k FROM KYCDocument k WHERE k.status = 'PENDING' ORDER BY k.createdAt ASC")
        List<KYCDocument> findPendingDocuments();

        @Query("SELECT k FROM KYCDocument k WHERE k.user.id = :userId AND k.documentType = :documentType AND k.status = 'PENDING'")
        Optional<KYCDocument> findPendingByUserIdAndDocumentType(@Param("userId") String userId,
                        @Param("documentType") DocumentType documentType);

        @Query("SELECT k FROM KYCDocument k WHERE k.status = :status")
        Page<KYCDocument> findByStatus(@Param("status") DocumentStatus status, Pageable pageable);

        long countByStatus(DocumentStatus status);

        // Use TIMESTAMPDIFF for H2 compatibility - computes difference in hours
        @Query(value = "SELECT COALESCE(AVG(TIMESTAMPDIFF(MINUTE, created_at, verified_at) / 60.0), 0) " +
                        "FROM kyc_documents WHERE verified_at IS NOT NULL", nativeQuery = true)
        Double averageDecisionHours();

        // Use TIMESTAMPDIFF for H2 compatibility - counts where decision took more than
        // 6 hours
        @Query(value = "SELECT COUNT(*) FROM kyc_documents " +
                        "WHERE verified_at IS NOT NULL AND TIMESTAMPDIFF(HOUR, created_at, verified_at) > 6", nativeQuery = true)
        long countSlaBreaches();
}
