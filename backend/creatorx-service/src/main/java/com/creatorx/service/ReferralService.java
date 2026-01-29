package com.creatorx.service;

import com.creatorx.common.enums.ReferralStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.ReferralRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Referral;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.ReferralCodeDTO;
import com.creatorx.service.dto.ReferralStatsDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for managing referral system.
 * Handles referral code generation, application, and statistics.
 */
@Slf4j
@Service
public class ReferralService {

    private final ReferralRepository referralRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    private static final String REFERRAL_CODE_PREFIX = "CX";

    private final BigDecimal referrerReward;
    private final BigDecimal refereeReward;

    public ReferralService(
            ReferralRepository referralRepository,
            UserRepository userRepository,
            WalletService walletService,
            @Value("${creatorx.referral.referrer-reward:100.00}") BigDecimal referrerReward,
            @Value("${creatorx.referral.referee-reward:50.00}") BigDecimal refereeReward) {
        this.referralRepository = referralRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.referrerReward = referrerReward;
        this.refereeReward = refereeReward;
    }

    /**
     * Get or generate referral code for a user.
     * The code is stored on the user entity for efficient lookups.
     */
    @Transactional
    public ReferralCodeDTO getReferralCode(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Get existing code or generate and save a new one
        String code = user.getReferralCode();
        if (code == null || code.isEmpty()) {
            code = generateReferralCode(userId);
            user.setReferralCode(code);
            userRepository.save(user);
        }

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

        // Create referral record with configured reward amounts
        Referral referral = Referral.builder()
                .referrer(referrer)
                .referee(referee)
                .status(ReferralStatus.PENDING)
                .referrerReward(referrerReward)
                .refereeReward(refereeReward)
                .rewardAmount(referrerReward.add(refereeReward))
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
     * Credits rewards to both referrer and referee wallets.
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

        String referrerId = referral.getReferrer().getId();

        referral.setStatus(ReferralStatus.COMPLETED);
        referral.setCompletedAt(java.time.LocalDateTime.now());
        referralRepository.save(referral);

        log.info("Referral completed: referrer={}, referee={}", referrerId, refereeUserId);

        // Credit referrer bonus
        Map<String, Object> referrerMetadata = new HashMap<>();
        referrerMetadata.put("referralId", referral.getId());
        referrerMetadata.put("refereeId", refereeUserId);
        referrerMetadata.put("type", "referrer_bonus");
        walletService.creditWalletWithType(
                referrerId,
                referral.getReferrerReward(),
                "Referral bonus for inviting a new user",
                null,
                TransactionType.BONUS,
                referrerMetadata
        );
        log.info("Credited referrer bonus: user={}, amount={}", referrerId, referral.getReferrerReward());

        // Credit referee welcome bonus
        Map<String, Object> refereeMetadata = new HashMap<>();
        refereeMetadata.put("referralId", referral.getId());
        refereeMetadata.put("referrerId", referrerId);
        refereeMetadata.put("type", "referee_welcome_bonus");
        walletService.creditWalletWithType(
                refereeUserId,
                referral.getRefereeReward(),
                "Welcome bonus for joining via referral",
                null,
                TransactionType.BONUS,
                refereeMetadata
        );
        log.info("Credited referee welcome bonus: user={}, amount={}", refereeUserId, referral.getRefereeReward());
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
     * Uses efficient database lookup via the referral_code index.
     */
    private String decodeReferralCode(String code) {
        if (code == null || !code.startsWith(REFERRAL_CODE_PREFIX)) {
            return null;
        }

        try {
            // Efficient O(1) lookup using the indexed referral_code column
            return userRepository.findByReferralCode(code)
                    .map(User::getId)
                    .orElse(null);
        } catch (Exception e) {
            log.warn("Failed to decode referral code: {}", code, e);
            return null;
        }
    }
}
