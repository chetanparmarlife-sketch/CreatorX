package com.creatorx.api.controller;

import com.creatorx.api.dto.PageResponse;
import com.creatorx.repository.entity.User;
import com.creatorx.service.InvoiceService;
import com.creatorx.service.dto.InvoiceDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for invoice endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    /**
     * Get invoices for the current creator (paginated)
     */
    @GetMapping
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<PageResponse<InvoiceDTO>> getInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Page<InvoiceDTO> invoices = invoiceService.getInvoices(currentUser.getId(), status, page, size);
        return ResponseEntity.ok(PageResponse.from(invoices));
    }

    /**
     * Get a single invoice by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<InvoiceDTO> getInvoice(
            @PathVariable String id,
            Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        InvoiceDTO invoice = invoiceService.getInvoice(currentUser.getId(), id);
        return ResponseEntity.ok(invoice);
    }

    /**
     * Get invoice counts by status
     */
    @GetMapping("/counts")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<InvoiceService.InvoiceCountsDTO> getInvoiceCounts(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        InvoiceService.InvoiceCountsDTO counts = invoiceService.getInvoiceCounts(currentUser.getId());
        return ResponseEntity.ok(counts);
    }

    /**
     * Download invoice as PDF
     */
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @PathVariable String id,
            Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        byte[] pdfBytes = invoiceService.generateInvoicePdf(currentUser.getId(), id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice-" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    // Helper method to extract User from Authentication
    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        throw new org.springframework.security.access.AccessDeniedException("Invalid authentication principal");
    }
}
