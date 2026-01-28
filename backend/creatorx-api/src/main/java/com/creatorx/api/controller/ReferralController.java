package com.creatorx.api.controller;

import com.creatorx.api.dto.ApplyReferralRequest;
import com.creatorx.repository.entity.User;
import com.creatorx.service.ReferralService;
import com.creatorx.service.dto.ReferralCodeDTO;
import com.creatorx.service.dto.ReferralStatsDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for referral system endpoints.
 * Handles referral code generation, application, and statistics.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;

    /**
     * Get the current user's referral code.
     */
    @GetMapping("/code")
    @PreAuthorize("hasAnyRole('CREATOR', 'BRAND')")
    public ResponseEntity<ReferralCodeDTO> getReferralCode(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ReferralCodeDTO referralCode = referralService.getReferralCode(currentUser.getId());
        return ResponseEntity.ok(referralCode);
    }

    /**
     * Apply a referral code.
     */
    @PostMapping("/apply")
    @PreAuthorize("hasAnyRole('CREATOR', 'BRAND')")
    public ResponseEntity<Void> applyReferralCode(
            @Valid @RequestBody ApplyReferralRequest request,
            Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        referralService.applyReferralCode(currentUser.getId(), request.getCode());
        return ResponseEntity.ok().build();
    }

    /**
     * Get referral statistics for the current user.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('CREATOR', 'BRAND')")
    public ResponseEntity<ReferralStatsDTO> getReferralStats(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ReferralStatsDTO stats = referralService.getReferralStats(currentUser.getId());
        return ResponseEntity.ok(stats);
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
