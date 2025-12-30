package com.creatorx.repository;

import com.creatorx.repository.entity.BrandVerificationDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrandVerificationDocumentRepository extends JpaRepository<BrandVerificationDocument, String> {
    List<BrandVerificationDocument> findByBrandIdOrderBySubmittedAtDesc(String brandId);

    Optional<BrandVerificationDocument> findFirstByBrandIdOrderBySubmittedAtDesc(String brandId);

    List<BrandVerificationDocument> findByStatusOrderBySubmittedAtDesc(String status);

    long countByStatus(String status);
}
