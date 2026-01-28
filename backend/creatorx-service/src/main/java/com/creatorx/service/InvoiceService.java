package com.creatorx.service;

import com.creatorx.common.enums.InvoiceStatus;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.InvoiceRepository;
import com.creatorx.repository.entity.Invoice;
import com.creatorx.service.dto.InvoiceDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

/**
 * Service for managing invoices.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM d, yyyy");

    /**
     * Get invoices for a creator (paginated)
     */
    @Transactional(readOnly = true)
    public Page<InvoiceDTO> getInvoices(String creatorId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));

        Page<Invoice> invoices;
        if (status != null && !status.equalsIgnoreCase("all")) {
            try {
                InvoiceStatus invoiceStatus = InvoiceStatus.valueOf(status.toUpperCase());
                invoices = invoiceRepository.findByCreatorIdAndStatus(creatorId, invoiceStatus, pageable);
            } catch (IllegalArgumentException e) {
                // Invalid status, return all
                invoices = invoiceRepository.findByCreatorId(creatorId, pageable);
            }
        } else {
            invoices = invoiceRepository.findByCreatorId(creatorId, pageable);
        }

        return invoices.map(this::toDTO);
    }

    /**
     * Get a single invoice by ID
     */
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoice(String creatorId, String invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndCreatorId(invoiceId, creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));
        return toDTO(invoice);
    }

    /**
     * Get invoice counts by status for a creator
     */
    @Transactional(readOnly = true)
    public InvoiceCountsDTO getInvoiceCounts(String creatorId) {
        long paid = invoiceRepository.countByCreatorIdAndStatus(creatorId, InvoiceStatus.PAID);
        long pending = invoiceRepository.countByCreatorIdAndStatus(creatorId, InvoiceStatus.PENDING);
        long overdue = invoiceRepository.countByCreatorIdAndStatus(creatorId, InvoiceStatus.OVERDUE);

        return InvoiceCountsDTO.builder()
                .paid(paid)
                .pending(pending)
                .overdue(overdue)
                .build();
    }

    /**
     * Generate PDF for an invoice (placeholder - returns invoice data)
     * In a real implementation, this would generate an actual PDF
     */
    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(String creatorId, String invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndCreatorId(invoiceId, creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));

        // TODO: Implement actual PDF generation using a library like iText or Apache
        // PDFBox
        // For now, return a placeholder
        String pdfContent = String.format(
                "INVOICE: %s\nBrand: %s\nCampaign: %s\nAmount: %s %s\nDue: %s",
                invoice.getInvoiceNumber(),
                invoice.getBrandName(),
                invoice.getCampaignName(),
                invoice.getCurrency(),
                invoice.getAmount(),
                invoice.getDueDate());

        log.info("Generated PDF for invoice: {}", invoiceId);
        return pdfContent.getBytes();
    }

    /**
     * Convert entity to DTO
     */
    private InvoiceDTO toDTO(Invoice invoice) {
        return InvoiceDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .campaignName(invoice.getCampaignName())
                .brandName(invoice.getBrandName())
                .amount(invoice.getAmount())
                .currency(invoice.getCurrency())
                .status(invoice.getStatus().name().toLowerCase())
                .issueDate(invoice.getIssueDate().format(DATE_FORMATTER))
                .dueDate(invoice.getDueDate().format(DATE_FORMATTER))
                .paidDate(invoice.getPaidDate() != null ? invoice.getPaidDate().format(DATE_FORMATTER) : null)
                .description(invoice.getDescription())
                .build();
    }

    /**
     * Inner DTO for invoice counts
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class InvoiceCountsDTO {
        private long paid;
        private long pending;
        private long overdue;
    }
}
