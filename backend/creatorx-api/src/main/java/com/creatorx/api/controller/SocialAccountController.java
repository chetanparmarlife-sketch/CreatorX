package com.creatorx.api.controller;

import com.creatorx.common.enums.SocialProvider;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.service.SocialAccountService;
import com.creatorx.service.dto.SocialAccountDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/creator/social-accounts")
@Tag(name = "Social Accounts", description = "Creator social account metadata")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CREATOR')")
public class SocialAccountController {
    private final SocialAccountService socialAccountService;

    @GetMapping
    @Operation(summary = "Get creator social accounts")
    public ResponseEntity<List<SocialAccountDTO>> getAccounts(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(socialAccountService.getSocialAccounts(userId));
    }

    @PostMapping("/{provider}/refresh")
    @Operation(summary = "Refresh social account metrics")
    public ResponseEntity<SocialAccountDTO> refresh(
            @PathVariable String provider,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(socialAccountService.refreshSocialAccount(userId, resolveProvider(provider), true));
    }

    @PostMapping("/{provider}/disconnect")
    @Operation(summary = "Disconnect social account")
    public ResponseEntity<Void> disconnect(
            @PathVariable String provider,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        socialAccountService.disconnectSocialAccount(userId, resolveProvider(provider));
        return ResponseEntity.noContent().build();
    }

    private SocialProvider resolveProvider(String raw) {
        try {
            return SocialProvider.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Unsupported provider", "SOCIAL_PROVIDER_INVALID");
        }
    }
}
