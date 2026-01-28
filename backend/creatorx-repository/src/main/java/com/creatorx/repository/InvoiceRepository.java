package com.creatorx.repository;

import com.creatorx.common.enums.InvoiceStatus;
import com.creatorx.repository.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Invoice entity.
 */
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {

    /**
     * Find all invoices for a creator (paginated)
     */
    @Query("SELECT i FROM Invoice i WHERE i.creator.id = :creatorId ORDER BY i.createdAt DESC")
    Page<Invoice> findByCreatorId(@Param("creatorId") String creatorId, Pageable pageable);

    /**
     * Find all invoices for a creator with status filter
     */
    @Query("SELECT i FROM Invoice i WHERE i.creator.id = :creatorId AND i.status = :status ORDER BY i.createdAt DESC")
    Page<Invoice> findByCreatorIdAndStatus(
            @Param("creatorId") String creatorId,
            @Param("status") InvoiceStatus status,
            Pageable pageable);

    /**
     * Find invoice by ID and creator (ownership check)
     */
    @Query("SELECT i FROM Invoice i WHERE i.id = :id AND i.creator.id = :creatorId")
    Optional<Invoice> findByIdAndCreatorId(@Param("id") String id, @Param("creatorId") String creatorId);

    /**
     * Find invoice by invoice number
     */
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    /**
     * Count invoices by status for a creator
     */
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.creator.id = :creatorId AND i.status = :status")
    long countByCreatorIdAndStatus(@Param("creatorId") String creatorId, @Param("status") InvoiceStatus status);
}
