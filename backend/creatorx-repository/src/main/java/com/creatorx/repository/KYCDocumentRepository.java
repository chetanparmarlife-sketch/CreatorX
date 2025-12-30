package com.creatorx.repository;

import com.creatorx.common.enums.DocumentStatus;
import com.creatorx.common.enums.DocumentType;
import com.creatorx.repository.entity.KYCDocument;
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
    List<KYCDocument> findByUserIdAndDocumentType(@Param("userId") String userId, @Param("documentType") DocumentType documentType);
    
    @Query("SELECT k FROM KYCDocument k WHERE k.user.id = :userId AND k.status = :status ORDER BY k.createdAt DESC")
    List<KYCDocument> findByUserIdAndStatus(@Param("userId") String userId, @Param("status") DocumentStatus status);
    
    @Query("SELECT COUNT(k) FROM KYCDocument k WHERE k.user.id = :userId AND k.status = 'APPROVED'")
    long countApprovedByUserId(@Param("userId") String userId);
    
    @Query("SELECT k FROM KYCDocument k WHERE k.status = 'PENDING' ORDER BY k.createdAt ASC")
    List<KYCDocument> findPendingDocuments();
    
    @Query("SELECT k FROM KYCDocument k WHERE k.user.id = :userId AND k.documentType = :documentType AND k.status = 'PENDING'")
    Optional<KYCDocument> findPendingByUserIdAndDocumentType(@Param("userId") String userId, @Param("documentType") DocumentType documentType);

    long countByStatus(DocumentStatus status);
}
