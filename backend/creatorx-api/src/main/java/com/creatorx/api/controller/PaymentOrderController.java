package com.creatorx.api.controller;

import com.creatorx.api.dto.CreatePaymentOrderRequest;
import com.creatorx.api.dto.PageResponse;
import com.creatorx.repository.entity.User;
import com.creatorx.service.PaymentCollectionService;
import com.creatorx.service.dto.PaymentOrderDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for payment order operations (brand payments)
 * Phase 4.2: Brand Payment Collection
 *
 * Endpoints:
 * - POST /api/v1/payments/orders - Create payment order
 * - GET /api/v1/payments/orders/{id} - Get payment order by ID
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentOrderController {

    private final PaymentCollectionService paymentCollectionService;

    /**
     * Create a payment order for brand deposit
     * Used by brands to fund campaigns
     */
    @PostMapping("/orders")
    @PreAuthorize("hasRole('BRAND')")
    public ResponseEntity<PaymentOrderDTO> createPaymentOrder(
            @Valid @RequestBody CreatePaymentOrderRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);

        // Generate idempotency key if not provided
        String effectiveIdempotencyKey = idempotencyKey != null ? idempotencyKey :
                UUID.randomUUID().toString();

        PaymentOrderDTO paymentOrder = paymentCollectionService.createPaymentOrder(
                currentUser.getId(),
                request.getCampaignId(),
                request.getAmount(),
                effectiveIdempotencyKey
        );

        log.info("Payment order created by brand {}: {} for {} INR",
                currentUser.getId(), paymentOrder.getId(), paymentOrder.getAmount());

        return ResponseEntity.status(HttpStatus.CREATED).body(paymentOrder);
    }

    /**
     * Get payment order by ID
     */
    @GetMapping("/orders/{id}")
    @PreAuthorize("hasRole('BRAND')")
    public ResponseEntity<PaymentOrderDTO> getPaymentOrder(
            @PathVariable String id,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);

        PaymentOrderDTO paymentOrder = paymentCollectionService.getPaymentOrder(id);

        // Verify ownership
        if (!paymentOrder.getBrandId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(paymentOrder);
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
