package com.creatorx.service;

import com.creatorx.common.enums.ReferralStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.ReferralRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Referral;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.ReferralCodeDTO;
import com.creatorx.service.dto.ReferralStatsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

/**
 * Service for managing referral system.
 * Handles referral code generation, application, and statistics.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReferralService {

    private final ReferralRepository referralRepository;
    private final UserRepository userRepository;

    private static final String REFERRAL_CODE_PREFIX = "CX";
    private static final BigDecimal DEFAULT_REFERRER_REWARD = new BigDecimal("100.00");
    private static final BigDecimal DEFAULT_REFEREE_REWARD = new BigDecimal("50.00");

    /**
     * Get or generate referral code for a user.
     * The code is deterministically generated from the user ID.
     */
    @Transactional(readOnly = true)
    public ReferralCodeDTO getReferralCode(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Generate deterministic referral code from user ID
        String code = generateReferralCode(userId);

        return ReferralCodeDTO.builder()
                .code(code)
                .createdAt(user.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();
    }

    /**
     * Apply a referral code for a new user.
     * Creates a referral relationship between referrer and referee.
     */
    @Transactional
    public void applyReferralCode(String refereeUserId, String referralCode) {
        // Find referee (the user applying the code)
        User referee = userRepository.findById(refereeUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", refereeUserId));

        // Check if user has already been referred
        if (referralRepository.existsByRefereeId(refereeUserId)) {
            throw new BusinessException("You have already used a referral code");
        }

        // Decode referral code to find referrer
        String referrerId = decodeReferralCode(referralCode);
        if (referrerId == null) {
            throw new BusinessException("Invalid referral code");
        }

        // Cannot refer yourself
        if (referrerId.equals(refereeUserId)) {
            throw new BusinessException("You cannot use your own referral code");
        }

        // Find referrer
        User referrer = userRepository.findById(referrerId)
                .orElseThrow(() -> new BusinessException("Invalid referral code"));

        // Create referral record
        Referral referral = Referral.builder()
                .referrer(referrer)
                .referee(referee)
                .status(ReferralStatus.PENDING)
                .referrerReward(DEFAULT_REFERRER_REWARD)
                .refereeReward(DEFAULT_REFEREE_REWARD)
                .rewardAmount(DEFAULT_REFERRER_REWARD.add(DEFAULT_REFEREE_REWARD))
                .build();

        referralRepository.save(referral);

        log.info("Referral applied: referrer={}, referee={}, code={}",
                referrerId, refereeUserId, referralCode);
    }

    /**
     * Get referral statistics for a user.
     */
    @Transactional(readOnly = true)
    public ReferralStatsDTO getReferralStats(String userId) {
        long totalReferrals = referralRepository.countByReferrerId(userId);
        long successfulReferrals = referralRepository.countByReferrerIdAndStatus(
                userId, ReferralStatus.COMPLETED);
        BigDecimal totalEarnings = referralRepository.sumReferrerRewardsByUserId(userId);

        return ReferralStatsDTO.builder()
                .totalReferrals(totalReferrals)
                .successfulReferrals(successfulReferrals)
                .totalEarnings(totalEarnings != null ? totalEarnings : BigDecimal.ZERO)
                .build();
    }

    /**
     * Complete a referral (mark as successful).
     * Called when referee completes qualifying action (e.g., first campaign).
     */
    @Transactional
    public void completeReferral(String refereeUserId) {
        Referral referral = referralRepository.findByRefereeId(refereeUserId)
                .orElse(null);

        if (referral == null) {
            log.debug("No referral found for user: {}", refereeUserId);
            return;
        }

        if (referral.getStatus() == ReferralStatus.COMPLETED) {
            log.debug("Referral already completed for user: {}", refereeUserId);
            return;
        }

        referral.setStatus(ReferralStatus.COMPLETED);
        referral.setCompletedAt(java.time.LocalDateTime.now());
        referralRepository.save(referral);

        log.info("Referral completed: referrer={}, referee={}",
                referral.getReferrer().getId(), refereeUserId);

        // TODO: Credit rewards to wallets when wallet service is ready
        // walletService.creditReferralReward(referral.getReferrer().getId(),
        // referral.getReferrerReward());
        // walletService.creditReferralReward(refereeUserId,
        // referral.getRefereeReward());
    }

    /**
     * Generate a deterministic referral code from user ID.
     */
    private String generateReferralCode(String userId) {
        // Create a short, URL-safe code from user ID
        String encoded = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(userId.getBytes())
                .substring(0, Math.min(8, userId.length()));
        return REFERRAL_CODE_PREFIX + encoded.toUpperCase();
    }

    /**
     * Decode a referral code to get the user ID.
     */
    private String decodeReferralCode(String code) {
        if (code == null || !code.startsWith(REFERRAL_CODE_PREFIX)) {
            return null;
        }

        try {
            String encoded = code.substring(REFERRAL_CODE_PREFIX.length());
            // For the simple encoding, we need to look up users
            // In a real system, you'd store the code or use a reversible encoding
            // For now, we'll search for users whose generated code matches
            return userRepository.findAll().stream()
                    .filter(user -> generateReferralCode(user.getId()).equals(code))
                    .map(User::getId)
                    .findFirst()
                    .orElse(null);
        } catch (Exception e) {
            log.warn("Failed to decode referral code: {}", code, e);
            return null;
        }
    }
}
