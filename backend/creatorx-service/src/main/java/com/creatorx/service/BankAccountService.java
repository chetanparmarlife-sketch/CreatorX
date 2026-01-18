package com.creatorx.service;

import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.BankAccountRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BankAccount;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.BankAccountDTO;
import com.creatorx.service.mapper.BankAccountMapper;
import com.creatorx.service.razorpay.RazorpayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BankAccountService {
    
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;
    private final BankAccountMapper bankAccountMapper;
    private final Optional<RazorpayService> razorpayService;
    
    /**
     * Get bank accounts for user
     */
    @Transactional(readOnly = true)
    public List<BankAccountDTO> getBankAccounts(String userId) {
        List<BankAccount> bankAccounts = bankAccountRepository.findByUserId(userId);
        return bankAccounts.stream()
                .map(bankAccountMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Add bank account
     */
    @Transactional
    public BankAccountDTO addBankAccount(String userId, String accountHolderName, String accountNumber,
                                        String ifscCode, String bankName, String branchName, String upiId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        
        // Validate IFSC code format
        if (!isValidIFSC(ifscCode)) {
            throw new BusinessException("Invalid IFSC code format. Expected: AAAA0XXXXXX (e.g., SBIN0001234)");
        }
        
        // Validate account number format
        if (!isValidAccountNumber(accountNumber)) {
            throw new BusinessException("Invalid account number. Must be 9-18 digits");
        }
        
        // Check if this is the first account (set as default)
        List<BankAccount> existingAccounts = bankAccountRepository.findByUserId(userId);
        boolean isDefault = existingAccounts.isEmpty();
        
        // If setting as default, unset other defaults
        if (isDefault) {
            existingAccounts.forEach(account -> account.setIsDefault(false));
            bankAccountRepository.saveAll(existingAccounts);
        }
        
        BankAccount bankAccount = BankAccount.builder()
                .user(user)
                .accountHolderName(accountHolderName)
                .accountNumber(accountNumber)
                .ifscCode(ifscCode.toUpperCase())
                .bankName(bankName)
                .branchName(branchName)
                .upiId(upiId)
                .verified(false) // Requires verification
                .isDefault(isDefault)
                .build();
        
        bankAccount = bankAccountRepository.save(bankAccount);

        log.info("Bank account added: {} for user: {}", bankAccount.getId(), userId);

        // Phase 4: Trigger penny drop verification
        if (razorpayService.isPresent()) {
            try {
                boolean verified = razorpayService.get().verifyBankAccount(bankAccount);
                if (verified) {
                    bankAccount.setVerified(true);
                    bankAccountRepository.save(bankAccount);
                    log.info("Bank account {} verified via penny drop", bankAccount.getId());
                } else {
                    log.warn("Bank account {} penny drop verification returned false", bankAccount.getId());
                }
            } catch (Exception e) {
                log.warn("Penny drop verification failed for bank account {}: {}",
                        bankAccount.getId(), e.getMessage());
                // Account remains unverified - user can retry later
            }
        } else {
            log.info("RazorpayService not available - bank account {} remains unverified", bankAccount.getId());
        }

        return bankAccountMapper.toDTO(bankAccount);
    }
    
    /**
     * Delete bank account
     */
    @Transactional
    public void deleteBankAccount(String userId, String accountId) {
        BankAccount bankAccount = bankAccountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account", accountId));
        
        // Check if account has pending withdrawals
        if (!bankAccount.getWithdrawalRequests().isEmpty()) {
            boolean hasPending = bankAccount.getWithdrawalRequests().stream()
                    .anyMatch(wr -> wr.getStatus().name().equals("PENDING") || 
                                 wr.getStatus().name().equals("PROCESSING"));
            
            if (hasPending) {
                throw new BusinessException("Cannot delete bank account with pending withdrawals");
            }
        }
        
        // If this was the default account, set another as default
        if (bankAccount.getIsDefault()) {
            List<BankAccount> otherAccounts = bankAccountRepository.findByUserId(userId)
                    .stream()
                    .filter(ba -> !ba.getId().equals(accountId))
                    .collect(Collectors.toList());
            
            if (!otherAccounts.isEmpty()) {
                otherAccounts.get(0).setIsDefault(true);
                bankAccountRepository.save(otherAccounts.get(0));
            }
        }
        
        bankAccountRepository.delete(bankAccount);
        
        log.info("Bank account deleted: {} for user: {}", accountId, userId);
    }
    
    /**
     * Verify bank account (penny drop verification - Phase 4)
     * For now, just marks as verified
     */
    @Transactional
    public void verifyBankAccount(String accountId) {
        BankAccount bankAccount = bankAccountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account", accountId));
        
        bankAccount.setVerified(true);
        bankAccountRepository.save(bankAccount);
        
        log.info("Bank account verified: {}", accountId);
    }
    
    /**
     * Set default bank account
     */
    @Transactional
    public void setDefaultBankAccount(String userId, String accountId) {
        BankAccount bankAccount = bankAccountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account", accountId));
        
        // Unset all other defaults
        List<BankAccount> allAccounts = bankAccountRepository.findByUserId(userId);
        allAccounts.forEach(account -> account.setIsDefault(false));
        bankAccountRepository.saveAll(allAccounts);
        
        // Set this as default
        bankAccount.setIsDefault(true);
        bankAccountRepository.save(bankAccount);
        
        log.info("Default bank account set: {} for user: {}", accountId, userId);
    }
    
    // Validation helpers
    
    private boolean isValidIFSC(String ifscCode) {
        if (ifscCode == null || ifscCode.length() != 11) {
            return false;
        }
        // Format: AAAA0XXXXXX (4 letters, 1 zero, 6 alphanumeric)
        return ifscCode.matches("^[A-Z]{4}0[A-Z0-9]{6}$");
    }
    
    private boolean isValidAccountNumber(String accountNumber) {
        if (accountNumber == null) {
            return false;
        }
        // 9-18 digits
        return accountNumber.matches("^[0-9]{9,18}$");
    }
}

