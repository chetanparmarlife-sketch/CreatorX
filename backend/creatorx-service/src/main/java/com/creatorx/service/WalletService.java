package com.creatorx.service;

import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.settings.PlatformSettingKeys;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.TransactionRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.WalletRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.Transaction;
import com.creatorx.repository.entity.User;
import com.creatorx.repository.entity.Wallet;
import com.creatorx.service.dto.TransactionDTO;
import com.creatorx.service.dto.WalletDTO;
import com.creatorx.service.mapper.CampaignMapper;
import com.creatorx.service.mapper.TransactionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private static final BigDecimal MIN_WITHDRAWAL_AMOUNT = new BigDecimal("100.00");

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final TransactionMapper transactionMapper;
    private final CampaignMapper campaignMapper;
    private final PlatformSettingsResolver platformSettingsResolver;

    /**
     * Get wallet for user
     */
    @Transactional(readOnly = true)
    public WalletDTO getWallet(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", userId));

        BigDecimal availableBalance = wallet.getBalance();
        BigDecimal pendingBalance = wallet.getPendingBalance();
        BigDecimal totalBalance = availableBalance.add(pendingBalance);

        return WalletDTO.builder()
                .userId(wallet.getUserId())
                .balance(totalBalance)
                .availableBalance(availableBalance)
                .pendingBalance(pendingBalance)
                .totalEarnings(wallet.getTotalEarned())
                .totalWithdrawn(wallet.getTotalWithdrawn())
                .currency(wallet.getCurrency().name())
                .build();
    }

    /**
     * Get transactions for user (paginated)
     */
    @Transactional(readOnly = true)
    public Page<TransactionDTO> getTransactions(String userId, Pageable pageable) {
        Page<Transaction> transactions = transactionRepository.findByUserId(userId, pageable);

        return transactions.map(transaction -> {
            TransactionDTO dto = transactionMapper.toDTO(transaction);
            if (transaction.getCampaign() != null) {
                dto.setCampaign(campaignMapper.toDTO(transaction.getCampaign()));
                dto.setCampaignId(transaction.getCampaign().getId());
            }
            return dto;
        });
    }

    /**
     * Create transaction (internal use)
     */
    @Transactional
    public TransactionDTO createTransaction(String userId, TransactionType type, BigDecimal amount,
            String description, String campaignId) {
        return createTransaction(userId, type, amount, description, campaignId, null);
    }

    @Transactional
    public TransactionDTO createTransaction(String userId, TransactionType type, BigDecimal amount,
            String description, String campaignId, Map<String, Object> metadata) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Transaction amount must be greater than 0");
        }

        Campaign campaign = null;
        if (campaignId != null) {
            campaign = campaignRepository.findById(campaignId)
                    .orElse(null); // Campaign might not exist, that's okay
        }

        Transaction transaction = Transaction.builder()
                .user(user)
                .type(type)
                .amount(amount)
                .status(TransactionStatus.PENDING)
                .description(description)
                .campaign(campaign)
                .metadata(metadata != null ? metadata : new HashMap<>())
                .build();

        transaction = transactionRepository.save(transaction);

        log.info("Transaction created: {} for user: {} type: {} amount: {}",
                transaction.getId(), userId, type, amount);

        TransactionDTO dto = transactionMapper.toDTO(transaction);
        if (campaign != null) {
            dto.setCampaign(campaignMapper.toDTO(campaign));
            dto.setCampaignId(campaign.getId());
        }

        return dto;
    }

    /**
     * Credit wallet (add to available balance)
     * Uses pessimistic locking for atomic updates
     */
    @Transactional
    public void creditWallet(String userId, BigDecimal amount, String reason, String campaignId) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Credit amount must be greater than 0");
        }

        BigDecimal commissionPercent = platformSettingsResolver.getDecimal(
                PlatformSettingKeys.FEES_PLATFORM_COMMISSION_PERCENT,
                BigDecimal.ZERO);
        BigDecimal feeAmount = amount.multiply(commissionPercent)
                .divide(new BigDecimal("100"))
                .setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal netAmount = amount.subtract(feeAmount);
        if (netAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Net credit amount must be greater than 0");
        }

        // Lock wallet for update
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseGet(() -> {
                    // Create wallet if it doesn't exist
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    return Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .pendingBalance(BigDecimal.ZERO)
                            .totalEarned(BigDecimal.ZERO)
                            .totalWithdrawn(BigDecimal.ZERO)
                            .build();
                });

        // Update balance atomically
        wallet.setBalance(wallet.getBalance().add(netAmount));
        wallet.setTotalEarned(wallet.getTotalEarned().add(netAmount));
        walletRepository.save(wallet);

        // Create transaction record
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("grossAmount", amount);
        metadata.put("platformFeePercent", commissionPercent);
        metadata.put("platformFeeAmount", feeAmount);
        createTransaction(userId, TransactionType.EARNING, netAmount, reason, campaignId, metadata);

        log.info("Wallet credited: user={}, amount={}, fee={}, reason={}", userId, netAmount, feeAmount, reason);
    }

    /**
     * Debit wallet (subtract from available balance)
     * Uses pessimistic locking for atomic updates
     */
    @Transactional
    public void debitWallet(String userId, BigDecimal amount, String reason) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Debit amount must be greater than 0");
        }

        // Lock wallet for update (auto-create with zero balance so we get a clean
        // "Insufficient balance" error instead of a raw ResourceNotFoundException)
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    return walletRepository.save(Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .pendingBalance(BigDecimal.ZERO)
                            .totalEarned(BigDecimal.ZERO)
                            .totalWithdrawn(BigDecimal.ZERO)
                            .build());
                });

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("Insufficient balance. Available: " + wallet.getBalance());
        }

        // Update balance atomically
        wallet.setBalance(wallet.getBalance().subtract(amount));
        wallet.setTotalWithdrawn(wallet.getTotalWithdrawn().add(amount));
        walletRepository.save(wallet);

        // Create transaction record
        createTransaction(userId, TransactionType.WITHDRAWAL, amount, reason, null);

        log.info("Wallet debited: user={}, amount={}, reason={}", userId, amount, reason);
    }

    /**
     * Credit wallet with explicit transaction type (no fees applied).
     */
    @Transactional
    public void creditWalletWithType(
            String userId,
            BigDecimal amount,
            String reason,
            String campaignId,
            TransactionType transactionType,
            Map<String, Object> metadata) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Credit amount must be greater than 0");
        }

        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    return Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .pendingBalance(BigDecimal.ZERO)
                            .totalEarned(BigDecimal.ZERO)
                            .totalWithdrawn(BigDecimal.ZERO)
                            .build();
                });

        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        createTransaction(userId, transactionType, amount, reason, campaignId, metadata);

        log.info("Wallet credited: user={}, amount={}, type={}, reason={}", userId, amount, transactionType, reason);
    }

    /**
     * Debit wallet with explicit transaction type (no withdrawal totals).
     */
    @Transactional
    public void debitWalletWithType(
            String userId,
            BigDecimal amount,
            String reason,
            String campaignId,
            TransactionType transactionType,
            Map<String, Object> metadata) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Debit amount must be greater than 0");
        }

        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    return walletRepository.save(Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .pendingBalance(BigDecimal.ZERO)
                            .totalEarned(BigDecimal.ZERO)
                            .totalWithdrawn(BigDecimal.ZERO)
                            .build());
                });

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("Insufficient balance. Available: " + wallet.getBalance());
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        createTransaction(userId, transactionType, amount, reason, campaignId, metadata);

        log.info("Wallet debited: user={}, amount={}, type={}, reason={}", userId, amount, transactionType, reason);
    }

    /**
     * Get available balance (can be withdrawn)
     */
    @Transactional(readOnly = true)
    public BigDecimal getAvailableBalance(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", userId));
        return wallet.getBalance();
    }

    /**
     * Get pending balance (locked until deliverable approved)
     */
    @Transactional(readOnly = true)
    public BigDecimal getPendingBalance(String userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", userId));
        return wallet.getPendingBalance();
    }

    /**
     * Move pending balance to available balance (when deliverable is approved)
     */
    @Transactional
    public void movePendingToAvailable(String userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Amount must be greater than 0");
        }

        // Lock wallet for update
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", userId));

        if (wallet.getPendingBalance().compareTo(amount) < 0) {
            throw new BusinessException("Insufficient pending balance. Available: " + wallet.getPendingBalance());
        }

        // Move from pending to available
        int updated = walletRepository.movePendingToBalance(userId, amount);
        if (updated == 0) {
            throw new BusinessException("Failed to move pending balance. Insufficient pending balance.");
        }

        log.info("Moved pending to available: user={}, amount={}", userId, amount);
    }

    /**
     * Add to pending balance (when deliverable is submitted)
     */
    @Transactional
    public void addToPendingBalance(String userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Amount must be greater than 0");
        }

        // Lock wallet for update
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                    return Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .pendingBalance(BigDecimal.ZERO)
                            .totalEarned(BigDecimal.ZERO)
                            .totalWithdrawn(BigDecimal.ZERO)
                            .build();
                });

        wallet.setPendingBalance(wallet.getPendingBalance().add(amount));
        walletRepository.save(wallet);

        log.info("Added to pending balance: user={}, amount={}", userId, amount);
    }
}
