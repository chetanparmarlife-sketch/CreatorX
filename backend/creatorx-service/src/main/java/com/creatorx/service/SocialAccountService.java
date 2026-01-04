package com.creatorx.service;

import com.creatorx.common.enums.SocialProvider;
import com.creatorx.common.enums.SocialSyncStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.SocialAccountRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.SocialAccount;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.SocialAccountDTO;
import com.creatorx.service.security.TokenEncryptionService;
import com.creatorx.service.social.SocialMetrics;
import com.creatorx.service.social.SocialProviderClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SocialAccountService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final SocialAccountRepository socialAccountRepository;
    private final UserRepository userRepository;
    private final SocialProviderClient socialProviderClient;
    private final TokenEncryptionService tokenEncryptionService;

    @Value("${creatorx.social.refresh.auto-hours:6}")
    private int autoRefreshHours;

    @Value("${creatorx.social.refresh.manual-minutes:10}")
    private int manualRefreshMinutes;

    @Transactional(readOnly = true)
    public List<SocialAccountDTO> getSocialAccounts(String userId) {
        validateCreator(userId);
        return socialAccountRepository.findAllByUserId(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public SocialAccountDTO refreshSocialAccount(String userId, SocialProvider provider, boolean manualRefresh) {
        User user = validateCreator(userId);
        SocialAccount account = socialAccountRepository.findByUserIdAndProvider(user.getId(), provider)
                .orElseThrow(() -> new ResourceNotFoundException("Social account", provider.name()));

        if (!account.isConnected()) {
            throw new BusinessException("Account is not connected", "SOCIAL_NOT_CONNECTED");
        }

        LocalDateTime now = LocalDateTime.now();

        if (manualRefresh) {
            LocalDateTime lastManual = account.getLastManualRefreshAt();
            if (lastManual != null && Duration.between(lastManual, now).toMinutes() < manualRefreshMinutes) {
                throw new BusinessException("Refresh is rate limited. Please try again later.", "SOCIAL_REFRESH_RATE_LIMIT");
            }
            account.setLastManualRefreshAt(now);
        } else {
            LocalDateTime lastSynced = account.getLastSyncedAt();
            if (lastSynced != null && Duration.between(lastSynced, now).toHours() < autoRefreshHours) {
                return toDto(account);
            }
            if (isInBackoff(account, now)) {
                return toDto(account);
            }
        }

        if (account.getTokenExpiresAt() != null && account.getTokenExpiresAt().isBefore(now)) {
            markNeedsReauth(account, "Token expired");
            return toDto(socialAccountRepository.save(account));
        }

        String accessToken;
        try {
            accessToken = tokenEncryptionService.decrypt(account.getAccessTokenEncrypted());
        } catch (BusinessException e) {
            handleSyncFailure(account, e.getMessage(), false);
            return toDto(socialAccountRepository.save(account));
        }

        if (accessToken == null || accessToken.isBlank()) {
            markNeedsReauth(account, "Token missing");
            return toDto(socialAccountRepository.save(account));
        }

        try {
            SocialMetrics metrics = socialProviderClient.fetchMetrics(provider, accessToken);
            if (metrics != null) {
                account.setUsername(metrics.getUsername());
                account.setProfileUrl(metrics.getProfileUrl());
                account.setFollowerCount(metrics.getFollowerCount());
                account.setEngagementRate(metrics.getEngagementRate());
                account.setAvgViews(metrics.getAvgViews());
            }
            account.setSyncStatus(SocialSyncStatus.CONNECTED);
            account.setLastSyncedAt(now);
            account.setLastFailureAt(null);
            account.setLastFailureMessage(null);
            account.setFailureCount(0);
        } catch (BusinessException e) {
            handleSyncFailure(account, e.getMessage(), isAuthFailure(e));
        } catch (Exception e) {
            handleSyncFailure(account, "Failed to refresh metrics", false);
        }

        return toDto(socialAccountRepository.save(account));
    }

    @Transactional
    public void disconnectSocialAccount(String userId, SocialProvider provider) {
        User user = validateCreator(userId);
        SocialAccount account = socialAccountRepository.findByUserIdAndProvider(user.getId(), provider)
                .orElseThrow(() -> new ResourceNotFoundException("Social account", provider.name()));

        account.setConnected(false);
        account.setSyncStatus(SocialSyncStatus.DISCONNECTED);
        account.setUsername(null);
        account.setProfileUrl(null);
        account.setFollowerCount(null);
        account.setEngagementRate(null);
        account.setAvgViews(null);
        account.setAccessTokenEncrypted(null);
        account.setRefreshTokenEncrypted(null);
        account.setTokenExpiresAt(null);
        account.setLastSyncedAt(null);
        account.setLastManualRefreshAt(null);
        account.setLastFailureAt(null);
        account.setLastFailureMessage(null);
        account.setFailureCount(0);

        socialAccountRepository.save(account);
    }

    @Transactional
    public int refreshEligibleAccounts() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(autoRefreshHours);
        List<SocialAccount> candidates = socialAccountRepository.findRefreshCandidates(SocialSyncStatus.CONNECTED, cutoff);
        int refreshed = 0;

        for (SocialAccount account : candidates) {
            try {
                refreshSocialAccount(account.getUser().getId(), account.getProvider(), false);
                refreshed++;
            } catch (Exception e) {
                log.warn("Auto refresh failed for provider {} user {}: {}", account.getProvider(), account.getUser().getId(), e.getMessage());
            }
        }

        return refreshed;
    }

    private User validateCreator(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (user.getRole() != UserRole.CREATOR) {
            throw new BusinessException("User is not a creator");
        }

        return user;
    }

    private SocialAccountDTO toDto(SocialAccount account) {
        SocialSyncStatus syncStatus = account.getSyncStatus() == null ? SocialSyncStatus.DISCONNECTED : account.getSyncStatus();
        String status = switch (syncStatus) {
            case CONNECTED -> "CONNECTED";
            case NEEDS_REAUTH, ERROR -> "NEEDS_RECONNECT";
            case PENDING -> "PENDING";
            default -> "DISCONNECTED";
        };

        return SocialAccountDTO.builder()
                .provider(account.getProvider())
                .connected(account.isConnected())
                .status(status)
                .username(account.getUsername())
                .profileUrl(account.getProfileUrl())
                .followerCount(account.getFollowerCount())
                .engagementRate(account.getEngagementRate())
                .avgViews(account.getAvgViews())
                .lastSyncedAt(account.getLastSyncedAt() != null ? account.getLastSyncedAt().format(DATE_FORMATTER) : null)
                .syncStatus(syncStatus)
                .errorMessage(account.getLastFailureMessage())
                .build();
    }

    private void markNeedsReauth(SocialAccount account, String reason) {
        account.setSyncStatus(SocialSyncStatus.NEEDS_REAUTH);
        account.setLastFailureMessage(reason);
        account.setLastFailureAt(LocalDateTime.now());
        account.setFailureCount(nextFailureCount(account));
    }

    private void handleSyncFailure(SocialAccount account, String message, boolean authFailure) {
        account.setSyncStatus(authFailure ? SocialSyncStatus.NEEDS_REAUTH : SocialSyncStatus.ERROR);
        account.setLastFailureMessage(message);
        account.setLastFailureAt(LocalDateTime.now());
        account.setFailureCount(nextFailureCount(account));
    }

    private boolean isAuthFailure(BusinessException e) {
        return "SOCIAL_AUTH_REQUIRED".equals(e.getErrorCode());
    }

    private boolean isInBackoff(SocialAccount account, LocalDateTime now) {
        if (account.getFailureCount() == null || account.getFailureCount() <= 0 || account.getLastFailureAt() == null) {
            return false;
        }
        int cappedFailures = Math.min(account.getFailureCount(), 6);
        long backoffMinutes = Math.min(360, (long) Math.pow(2, cappedFailures) * 10);
        return Duration.between(account.getLastFailureAt(), now).toMinutes() < backoffMinutes;
    }

    private int nextFailureCount(SocialAccount account) {
        int current = account.getFailureCount() == null ? 0 : account.getFailureCount();
        return current + 1;
    }
}
