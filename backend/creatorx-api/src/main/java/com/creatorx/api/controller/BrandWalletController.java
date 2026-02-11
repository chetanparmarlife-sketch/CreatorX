package com.creatorx.api.controller;

import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.entity.User;
import com.creatorx.service.BrandWalletService;
import com.creatorx.service.dto.BrandWalletDTO;
import com.creatorx.service.dto.EscrowTransactionDTO;
import com.creatorx.service.dto.PaymentOrderDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Controller for brand wallet and escrow management
 * Handles deposits, allocations, and transaction history
 */
@RestController
@RequestMapping("/api/v1/brand-wallet")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Brand Wallet", description = "Brand wallet and escrow management")
public class BrandWalletController {

    private final BrandWalletService brandWalletService;

    /**
     * Get brand wallet balance and stats
     */
    @GetMapping
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get wallet balance", description = "Get brand wallet balance and statistics")
    public ResponseEntity<BrandWalletDTO> getWallet(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        BrandWalletDTO wallet = brandWalletService.getWallet(currentUser.getId());
        return ResponseEntity.ok(wallet);
    }

    /**
     * Create deposit order to add funds to wallet
     */
    @PostMapping("/deposit")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Create deposit order", description = "Create Razorpay order to add funds to wallet")
    public ResponseEntity<PaymentOrderDTO> createDepositOrder(
            @Valid @RequestBody DepositRequest request,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);
        log.info("Creating deposit order: brand={}, amount={}", currentUser.getId(), request.getAmount());
        PaymentOrderDTO order = brandWalletService.createDepositOrder(currentUser.getId(), request.getAmount());
        return ResponseEntity.ok(order);
    }

    /**
     * Get escrow transaction history
     */
    @GetMapping("/transactions")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get transaction history", description = "Get brand wallet transaction history")
    public ResponseEntity<Page<EscrowTransactionDTO>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<EscrowTransactionDTO> transactions = brandWalletService.getTransactions(currentUser.getId(), pageable);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Allocate funds from wallet to campaign
     */
    @PostMapping("/campaigns/{campaignId}/allocate")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Allocate to campaign", description = "Allocate funds from wallet to campaign")
    public ResponseEntity<Void> allocateToCampaign(
            @PathVariable String campaignId,
            @Valid @RequestBody AllocationRequest request,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);
        log.info("Allocating funds: brand={}, campaign={}, amount={}", currentUser.getId(), campaignId, request.getAmount());
        brandWalletService.allocateToCampaign(currentUser.getId(), campaignId, request.getAmount());
        return ResponseEntity.ok().build();
    }

    /**
     * Get campaign escrow transactions
     */
    @GetMapping("/campaigns/{campaignId}/transactions")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get campaign transactions", description = "Get transaction history for a specific campaign")
    public ResponseEntity<Page<EscrowTransactionDTO>> getCampaignTransactions(
            @PathVariable String campaignId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<EscrowTransactionDTO> transactions = brandWalletService.getCampaignTransactions(campaignId, pageable);
        return ResponseEntity.ok(transactions);
    }

    // Helper method

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

    // Request DTOs

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepositRequest {
        @NotNull(message = "Amount is required")
        @Min(value = 1000, message = "Minimum deposit amount is ₹1,000")
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllocationRequest {
        @NotNull(message = "Amount is required")
        @Min(value = 1, message = "Amount must be positive")
        private BigDecimal amount;
    }
}
