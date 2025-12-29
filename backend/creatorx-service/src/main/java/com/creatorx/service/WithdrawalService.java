package com.creatorx.service;

import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.common.enums.WithdrawalStatus;
import com.creatorx.common.exception.BusinessException;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WithdrawalService {
    
    private static final BigDecimal MIN_WITHDRAWAL_AMOUNT = new BigDecimal("100.00");
    
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;
    private final BankAccountMapper bankAccountMapper;
    
    /**
     * Request withdrawal
     */
    @Transactional
    public WithdrawalDTO requestWithdrawal(String userId, BigDecimal amount, String bankAccountId) {
        // Validate amount
        if (amount.compareTo(MIN_WITHDRAWAL_AMOUNT) < 0) {
            throw new BusinessException("Minimum withdrawal amount is ₹" + MIN_WITHDRAWAL_AMOUNT);
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
        
        withdrawalRequest.setStatus(WithdrawalStatus.PROCESSING);
        withdrawalRequest.setProcessedBy(admin);
        withdrawalRequest.setProcessedAt(LocalDateTime.now());
        withdrawalRequestRepository.save(withdrawalRequest);
        
        // Update transaction status
        updateTransactionStatus(withdrawalRequest, TransactionStatus.COMPLETED);
        
        // TODO: Trigger Razorpay payout (Phase 4)
        log.info("Withdrawal approved: {} by admin: {}", withdrawalId, adminId);
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
}

