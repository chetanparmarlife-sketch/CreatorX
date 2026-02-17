package com.creatorx.repository;

import com.creatorx.repository.entity.BrandVerificationDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrandVerificationDocumentRepository extends JpaRepository<BrandVerificationDocument, String> {
    List<BrandVerificationDocument> findByBrandIdOrderBySubmittedAtDesc(String brandId);

    @EntityGraph(attributePaths = {"brand"})
    Optional<BrandVerificationDocument> findFirstByBrandIdOrderBySubmittedAtDesc(String brandId);

    List<BrandVerificationDocument> findByStatusOrderBySubmittedAtDesc(String status);

    @EntityGraph(attributePaths = {"brand"})
    Page<BrandVerificationDocument> findByStatus(String status, Pageable pageable);

    long countByBrandIdAndStatus(String brandId, String status);

    List<BrandVerificationDocument> findTop5ByBrandIdOrderBySubmittedAtDesc(String brandId);

    long countByStatus(String status);
}
