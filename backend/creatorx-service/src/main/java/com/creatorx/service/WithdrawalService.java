package com.creatorx.service;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.common.enums.WithdrawalStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.KYCNotVerifiedException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.BankAccountRepository;
import com.creatorx.repository.TransactionRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.WithdrawalRequestRepository;
import com.creatorx.repository.entity.BankAccount;
import com.creatorx.repository.entity.Transaction;
import com.creatorx.repository.entity.User;
import com.creatorx.repository.entity.WithdrawalRequest;
import com.creatorx.service.dto.BankAccountDTO;
import com.creatorx.service.dto.WithdrawalDTO;
import com.creatorx.service.mapper.BankAccountMapper;
import com.creatorx.service.admin.AdminAuditService;
import com.creatorx.service.PlatformSettingsResolver;
import com.creatorx.service.razorpay.RazorpayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
public class WithdrawalService {

    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;
    private final BankAccountMapper bankAccountMapper;
    private final AdminAuditService adminAuditService;
    private final PlatformSettingsResolver platformSettingsResolver;
    private final KYCService kycService;
    private final Optional<RazorpayService> razorpayService;

    // Configurable withdrawal limits
    private final BigDecimal minWithdrawalAmount;
    private final BigDecimal maxWithdrawalPerTransaction;
    private final BigDecimal maxWithdrawalPerMonth;

    public WithdrawalService(
            WithdrawalRequestRepository withdrawalRequestRepository,
            BankAccountRepository bankAccountRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            WalletService walletService,
            BankAccountMapper bankAccountMapper,
            AdminAuditService adminAuditService,
            PlatformSettingsResolver platformSettingsResolver,
            KYCService kycService,
            Optional<RazorpayService> razorpayService,
            @org.springframework.beans.factory.annotation.Value("${creatorx.withdrawal.min-amount:100.00}") BigDecimal minWithdrawalAmount,
            @org.springframework.beans.factory.annotation.Value("${creatorx.withdrawal.max-per-transaction:50000.00}") BigDecimal maxWithdrawalPerTransaction,
            @org.springframework.beans.factory.annotation.Value("${creatorx.withdrawal.max-per-month:200000.00}") BigDecimal maxWithdrawalPerMonth) {
        this.withdrawalRequestRepository = withdrawalRequestRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.walletService = walletService;
        this.bankAccountMapper = bankAccountMapper;
        this.adminAuditService = adminAuditService;
        this.platformSettingsResolver = platformSettingsResolver;
        this.kycService = kycService;
        this.razorpayService = razorpayService;
        this.minWithdrawalAmount = minWithdrawalAmount;
        this.maxWithdrawalPerTransaction = maxWithdrawalPerTransaction;
        this.maxWithdrawalPerMonth = maxWithdrawalPerMonth;
    }
    
    /**
     * Request withdrawal
     */
    @Transactional
    public WithdrawalDTO requestWithdrawal(String userId, BigDecimal amount, String bankAccountId) {
        if (!platformSettingsResolver.isPayoutWindowOpen(LocalDateTime.now())) {
            throw new BusinessException("Withdrawals are not available during the current payout window");
        }
        // Validate amount - minimum (configurable via creatorx.withdrawal.min-amount)
        if (amount.compareTo(minWithdrawalAmount) < 0) {
            throw new BusinessException("Minimum withdrawal amount is ₹" + minWithdrawalAmount);
        }

        // Validate amount - maximum per transaction (configurable via creatorx.withdrawal.max-per-transaction)
        if (amount.compareTo(maxWithdrawalPerTransaction) > 0) {
            throw new BusinessException("Maximum withdrawal amount per transaction is ₹" + maxWithdrawalPerTransaction);
        }

        // Validate monthly withdrawal limit (configurable via creatorx.withdrawal.max-per-month)
        BigDecimal monthlyTotal = getMonthlyWithdrawalTotal(userId);
        BigDecimal projectedTotal = monthlyTotal.add(amount);
        if (projectedTotal.compareTo(maxWithdrawalPerMonth) > 0) {
            BigDecimal remaining = maxWithdrawalPerMonth.subtract(monthlyTotal);
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Monthly withdrawal limit of ₹" + maxWithdrawalPerMonth + " reached");
            }
            throw new BusinessException("This withdrawal would exceed monthly limit. Maximum remaining: ₹" + remaining);
        }

        // Check available balance
        BigDecimal availableBalance = walletService.getAvailableBalance(userId);
        if (amount.compareTo(availableBalance) > 0) {
            throw new BusinessException("Insufficient balance. Available: ₹" + availableBalance);
        }
        
        // Verify bank account exists and belongs to user
        BankAccount bankAccount = bankAccountRepository.findByIdAndUserId(bankAccountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account", bankAccountId));
        
        // Verify bank account is verified
        if (!bankAccount.getVerified()) {
            throw new BusinessException("Bank account must be verified before withdrawal");
        }
        
        // Create withdrawal request
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        WithdrawalRequest withdrawalRequest = WithdrawalRequest.builder()
                .user(user)
                .amount(amount)
                .bankAccount(bankAccount)
                .status(WithdrawalStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();
        
        withdrawalRequest = withdrawalRequestRepository.save(withdrawalRequest);
        
        // Debit wallet (move to pending withdrawal)
        walletService.debitWallet(userId, amount, "Withdrawal request: " + withdrawalRequest.getId());
        
        // Create transaction record
        Transaction transaction = Transaction.builder()
                .user(user)
                .type(TransactionType.WITHDRAWAL)
                .amount(amount)
                .status(TransactionStatus.PENDING)
                .description("Withdrawal request: " + withdrawalRequest.getId())
                .build();
        transaction.getMetadata().put("withdrawalRequestId", withdrawalRequest.getId());
        transactionRepository.save(transaction);
        
        log.info("Withdrawal requested: {} by user: {} amount: {}", 
                withdrawalRequest.getId(), userId, amount);
        
        return toDTO(withdrawalRequest);
    }
    
    /**
     * Get withdrawals for user
     */
    @Transactional(readOnly = true)
    public Page<WithdrawalDTO> getWithdrawals(String userId, Pageable pageable) {
        Page<WithdrawalRequest> withdrawals = withdrawalRequestRepository.findByUserId(userId, pageable);
        return withdrawals.map(this::toDTO);
    }
    
    /**
     * Cancel withdrawal (only if PENDING)
     */
    @Transactional
    public void cancelWithdrawal(String userId, String withdrawalId) {
        WithdrawalRequest withdrawalRequest = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request", withdrawalId));
        
        // Verify user owns the withdrawal
        if (!withdrawalRequest.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only cancel your own withdrawals");
        }
        
        // Only allow cancellation if PENDING
        if (withdrawalRequest.getStatus() != WithdrawalStatus.PENDING) {
            throw new BusinessException("Can only cancel PENDING withdrawal requests");
        }
        
        // Refund to wallet
        walletService.creditWallet(
                userId,
                withdrawalRequest.getAmount(),
                "Withdrawal cancellation: " + withdrawalId,
                null
        );
        
        // Update transaction status
        List<Transaction> transactions = transactionRepository.findByUserId(userId, Pageable.unpaged())
                .getContent()
                .stream()
                .filter(t -> t.getMetadata() != null && 
                           withdrawalId.equals(t.getMetadata().get("withdrawalRequestId")))
                .collect(Collectors.toList());
        
        transactions.forEach(t -> {
            t.setStatus(TransactionStatus.CANCELLED);
            transactionRepository.save(t);
        });
        
        // Delete withdrawal request
        withdrawalRequestRepository.delete(withdrawalRequest);
        
        log.info("Withdrawal cancelled: {} by user: {}", withdrawalId, userId);
    }
    
    /**
     * Approve withdrawal (Admin only, Phase 3)
     */
    @Transactional
    public void approveWithdrawal(String adminId, String withdrawalId) {
        WithdrawalRequest withdrawalRequest = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request", withdrawalId));
        
        if (withdrawalRequest.getStatus() != WithdrawalStatus.PENDING) {
            throw new BusinessException("Can only approve PENDING withdrawal requests");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));

        String userId = withdrawalRequest.getUser().getId();

        if (!kycService.isKYCVerified(userId)) {
            throw new KYCNotVerifiedException("KYC verification must be approved before payout processing");
        }

        String bankAccountId = withdrawalRequest.getBankAccount().getId();
        BankAccount bankAccount = bankAccountRepository.findByIdAndUserId(bankAccountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account", bankAccountId));

        if (!Boolean.TRUE.equals(bankAccount.getVerified())) {
            throw new BusinessException("Bank account must be verified before payout");
        }

        if (razorpayService.isEmpty()) {
            log.warn("RazorpayService not available - cannot create payout for withdrawal {}", withdrawalId);
            throw new BusinessException("Razorpay payout processing is not configured");
        }

        // Phase 4: Trigger Razorpay payout
        try {
            log.info("Creating Razorpay payout for withdrawal {} to bank account {}",
                    withdrawalId, maskAccountNumber(bankAccount.getAccountNumber()));

            String payoutId = razorpayService.get().createPayout(
                    withdrawalRequest.getId(), // idempotency key
                    withdrawalRequest.getAmount(),
                    bankAccount
            );
            withdrawalRequest.setRazorpayPayoutId(payoutId);
            withdrawalRequest.setStatus(WithdrawalStatus.PROCESSING);
            withdrawalRequest.setProcessedBy(admin);
            withdrawalRequest.setProcessedAt(LocalDateTime.now());
            withdrawalRequestRepository.save(withdrawalRequest);

            // Update transaction status
            updateTransactionStatus(withdrawalRequest, TransactionStatus.COMPLETED);

            HashMap<String, Object> details = new HashMap<>();
            details.put("status", WithdrawalStatus.PROCESSING.name());
            details.put("amount", withdrawalRequest.getAmount());

            adminAuditService.logAction(
                    adminId,
                    AdminActionType.PAYMENT_PROCESSED,
                    "WITHDRAWAL",
                    withdrawalRequest.getId(),
                    details,
                    null,
                    null
            );

            log.info("Withdrawal approved: {} by admin: {}", withdrawalId, adminId);
        } catch (Exception e) {
            String errorMessage = safeErrorMessage(e);
            log.error("Failed to create Razorpay payout for withdrawal {} (bank account {}): {}",
                    withdrawalId, maskAccountNumber(bankAccount.getAccountNumber()), errorMessage, e);

            if (withdrawalRequest.getRefundedAt() == null) {
                refundWithdrawal(withdrawalRequest, "Payout failed: " + errorMessage);
            } else {
                log.warn("Withdrawal {} already refunded at {} - skipping refund",
                        withdrawalId, withdrawalRequest.getRefundedAt());
            }

            withdrawalRequest.setStatus(WithdrawalStatus.FAILED);
            withdrawalRequest.setFailureReason("Razorpay payout failed: " + errorMessage);
            withdrawalRequest.setProcessedBy(admin);
            withdrawalRequest.setProcessedAt(LocalDateTime.now());
            withdrawalRequestRepository.save(withdrawalRequest);

            updateTransactionStatus(withdrawalRequest, TransactionStatus.FAILED);
            throw new BusinessException("Failed to process payout: " + errorMessage);
        }
    }
    
    /**
     * Process a pending withdrawal (for scheduler/automated processing)
     * Phase 4.2: Automated Payout Scheduler
     *
     * Similar to approveWithdrawal but without admin context
     * Used by PayoutScheduler for batch processing
     */
    @Transactional
    public void processWithdrawal(String withdrawalId) {
        WithdrawalRequest withdrawalRequest = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request", withdrawalId));

        if (withdrawalRequest.getStatus() != WithdrawalStatus.PENDING) {
            log.warn("Withdrawal {} is not in PENDING state (current: {}), skipping",
                    withdrawalId, withdrawalRequest.getStatus());
            return;
        }

        String userId = withdrawalRequest.getUser().getId();

        // Verify KYC
        if (!kycService.isKYCVerified(userId)) {
            log.warn("Withdrawal {} skipped - user {} KYC not verified", withdrawalId, userId);
            return;
        }

        String bankAccountId = withdrawalRequest.getBankAccount().getId();
        BankAccount bankAccount = bankAccountRepository.findByIdAndUserId(bankAccountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account", bankAccountId));

        // Verify bank account
        if (!Boolean.TRUE.equals(bankAccount.getVerified())) {
            log.warn("Withdrawal {} skipped - bank account {} not verified", withdrawalId, bankAccountId);
            return;
        }

        if (razorpayService.isEmpty()) {
            log.error("RazorpayService not available - cannot process withdrawal {}", withdrawalId);
            throw new BusinessException("Razorpay payout processing is not configured");
        }

        // Create Razorpay payout
        try {
            log.info("Creating Razorpay payout for withdrawal {} to bank account {}",
                    withdrawalId, maskAccountNumber(bankAccount.getAccountNumber()));

            String payoutId = razorpayService.get().createPayout(
                    withdrawalRequest.getId(),
                    withdrawalRequest.getAmount(),
                    bankAccount
            );

            withdrawalRequest.setRazorpayPayoutId(payoutId);
            withdrawalRequest.setStatus(WithdrawalStatus.PROCESSING);
            withdrawalRequest.setProcessedAt(LocalDateTime.now());
            withdrawalRequestRepository.save(withdrawalRequest);

            updateTransactionStatus(withdrawalRequest, TransactionStatus.COMPLETED);

            log.info("Withdrawal {} processing initiated, Razorpay payout: {}", withdrawalId, payoutId);

        } catch (Exception e) {
            String errorMessage = safeErrorMessage(e);
            log.error("Failed to create Razorpay payout for withdrawal {}: {}", withdrawalId, errorMessage, e);

            if (withdrawalRequest.getRefundedAt() == null) {
                refundWithdrawal(withdrawalRequest, "Payout failed: " + errorMessage);
            }

            withdrawalRequest.setStatus(WithdrawalStatus.FAILED);
            withdrawalRequest.setFailureReason("Razorpay payout failed: " + errorMessage);
            withdrawalRequest.setProcessedAt(LocalDateTime.now());
            withdrawalRequestRepository.save(withdrawalRequest);

            updateTransactionStatus(withdrawalRequest, TransactionStatus.FAILED);
            throw new BusinessException("Failed to process payout: " + errorMessage);
        }
    }

    /**
     * Reject withdrawal (Admin only, Phase 3)
     */
    @Transactional
    public void rejectWithdrawal(String adminId, String withdrawalId, String reason) {
        WithdrawalRequest withdrawalRequest = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request", withdrawalId));
        
        if (withdrawalRequest.getStatus() != WithdrawalStatus.PENDING) {
            throw new BusinessException("Can only reject PENDING withdrawal requests");
        }
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        
        withdrawalRequest.setStatus(WithdrawalStatus.REJECTED);
        withdrawalRequest.setProcessedBy(admin);
        withdrawalRequest.setProcessedAt(LocalDateTime.now());
        withdrawalRequest.setFailureReason(reason);
        withdrawalRequestRepository.save(withdrawalRequest);
        
        // Refund to wallet
        walletService.creditWallet(
                withdrawalRequest.getUser().getId(),
                withdrawalRequest.getAmount(),
                "Withdrawal rejection refund: " + withdrawalId,
                null
        );
        
        // Update transaction status
        updateTransactionStatus(withdrawalRequest, TransactionStatus.FAILED);

        HashMap<String, Object> details = new HashMap<>();
        details.put("status", WithdrawalStatus.REJECTED.name());
        details.put("amount", withdrawalRequest.getAmount());
        details.put("reason", reason);

        adminAuditService.logAction(
                adminId,
                AdminActionType.PAYMENT_PROCESSED,
                "WITHDRAWAL",
                withdrawalRequest.getId(),
                details,
                null,
                null
        );

        log.info("Withdrawal rejected: {} by admin: {} reason: {}", withdrawalId, adminId, reason);
    }
    
    // Helper methods
    
    private WithdrawalDTO toDTO(WithdrawalRequest withdrawalRequest) {
        BankAccountDTO bankAccountDTO = bankAccountMapper.toDTO(withdrawalRequest.getBankAccount());
        
        return WithdrawalDTO.builder()
                .id(withdrawalRequest.getId())
                .amount(withdrawalRequest.getAmount())
                .bankAccount(bankAccountDTO)
                .status(withdrawalRequest.getStatus())
                .failureReason(withdrawalRequest.getFailureReason())
                .requestedAt(withdrawalRequest.getRequestedAt())
                .processedAt(withdrawalRequest.getProcessedAt())
                .build();
    }
    
    private void updateTransactionStatus(WithdrawalRequest withdrawalRequest, TransactionStatus status) {
        List<Transaction> transactions = transactionRepository.findByUserId(
                withdrawalRequest.getUser().getId(), 
                Pageable.unpaged()
        ).getContent()
        .stream()
        .filter(t -> t.getMetadata() != null && 
                   withdrawalRequest.getId().equals(t.getMetadata().get("withdrawalRequestId")))
        .collect(Collectors.toList());
        
        transactions.forEach(t -> {
            t.setStatus(status);
            transactionRepository.save(t);
        });
    }

    private void refundWithdrawal(WithdrawalRequest withdrawalRequest, String reason) {
        BigDecimal amount = withdrawalRequest.getAmount();
        String userId = withdrawalRequest.getUser().getId();

        HashMap<String, Object> metadata = new HashMap<>();
        metadata.put("reason", reason);
        metadata.put("withdrawalRequestId", withdrawalRequest.getId());
        metadata.put("razorpayPayoutId", withdrawalRequest.getRazorpayPayoutId());
        metadata.put("originalStatus", withdrawalRequest.getStatus().name());

        walletService.creditWalletWithType(
                userId,
                amount,
                reason,
                null,
                TransactionType.REFUND,
                metadata
        );

        withdrawalRequest.setRefundedAt(LocalDateTime.now());

        log.info("Refunded {} to user {} for withdrawal {}", amount, userId, withdrawalRequest.getId());
    }

    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() <= 4) {
            return "XXXX";
        }
        return "XXXX" + accountNumber.substring(accountNumber.length() - 4);
    }

    private String safeErrorMessage(Exception e) {
        String message = e.getMessage();
        if (message == null || message.trim().isEmpty()) {
            return "Unknown error";
        }
        return message;
    }

    /**
     * Calculate total withdrawals for user in current month
     * Includes PENDING, PROCESSING, and COMPLETED withdrawals
     * Excludes FAILED, REJECTED, and CANCELLED
     */
    private BigDecimal getMonthlyWithdrawalTotal(String userId) {
        LocalDateTime startOfMonth = LocalDateTime.now()
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

        List<WithdrawalRequest> monthlyWithdrawals = withdrawalRequestRepository
                .findByUserIdAndRequestedAtAfter(userId, startOfMonth);

        return monthlyWithdrawals.stream()
                .filter(w -> w.getStatus() == WithdrawalStatus.PENDING
                        || w.getStatus() == WithdrawalStatus.PROCESSING
                        || w.getStatus() == WithdrawalStatus.COMPLETED)
                .map(WithdrawalRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
