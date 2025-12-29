package com.creatorx.api.controller;

import com.creatorx.api.dto.BankAccountRequest;
import com.creatorx.api.dto.TransactionRequest;
import com.creatorx.api.dto.WithdrawalRequestDTO;
import com.creatorx.service.BankAccountService;
import com.creatorx.service.WalletService;
import com.creatorx.service.WithdrawalService;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.BankAccountDTO;
import com.creatorx.service.dto.TransactionDTO;
import com.creatorx.service.dto.WalletDTO;
import com.creatorx.service.dto.WithdrawalDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {
    
    private final WalletService walletService;
    private final WithdrawalService withdrawalService;
    private final BankAccountService bankAccountService;
    
    /**
     * Get wallet balance
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('CREATOR', 'BRAND')")
    public ResponseEntity<WalletDTO> getWallet(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        WalletDTO wallet = walletService.getWallet(currentUser.getId());
        return ResponseEntity.ok(wallet);
    }
    
    /**
     * Get transactions (paginated)
     */
    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('CREATOR', 'BRAND')")
    public ResponseEntity<Page<TransactionDTO>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        // Validate page size (max 100)
        int validatedSize = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, validatedSize);
        Page<TransactionDTO> transactions = walletService.getTransactions(currentUser.getId(), pageable);
        return ResponseEntity.ok(transactions);
    }
    
    /**
     * Request withdrawal
     */
    @PostMapping("/withdraw")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<WithdrawalDTO> requestWithdrawal(
            @Valid @RequestBody WithdrawalRequestDTO request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        WithdrawalDTO withdrawal = withdrawalService.requestWithdrawal(
                currentUser.getId(),
                request.getAmount(),
                request.getBankAccountId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(withdrawal);
    }
    
    /**
     * Get withdrawals (paginated)
     */
    @GetMapping("/withdrawals")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<Page<WithdrawalDTO>> getWithdrawals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        // Validate page size (max 100)
        int validatedSize = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, validatedSize);
        Page<WithdrawalDTO> withdrawals = withdrawalService.getWithdrawals(currentUser.getId(), pageable);
        return ResponseEntity.ok(withdrawals);
    }
    
    /**
     * Cancel withdrawal
     */
    @DeleteMapping("/withdrawals/{id}")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<Void> cancelWithdrawal(
            @PathVariable String id,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        withdrawalService.cancelWithdrawal(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get bank accounts
     */
    @GetMapping("/bank-accounts")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<List<BankAccountDTO>> getBankAccounts(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        List<BankAccountDTO> bankAccounts = bankAccountService.getBankAccounts(currentUser.getId());
        return ResponseEntity.ok(bankAccounts);
    }
    
    /**
     * Add bank account
     */
    @PostMapping("/bank-accounts")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<BankAccountDTO> addBankAccount(
            @Valid @RequestBody BankAccountRequest request,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        BankAccountDTO bankAccount = bankAccountService.addBankAccount(
                currentUser.getId(),
                request.getAccountHolderName(),
                request.getAccountNumber(),
                request.getIfscCode(),
                request.getBankName(),
                request.getBranchName(),
                request.getUpiId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(bankAccount);
    }
    
    /**
     * Delete bank account
     */
    @DeleteMapping("/bank-accounts/{id}")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<Void> deleteBankAccount(
            @PathVariable String id,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        bankAccountService.deleteBankAccount(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Set default bank account
     */
    @PutMapping("/bank-accounts/{id}/default")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<Void> setDefaultBankAccount(
            @PathVariable String id,
            Authentication authentication
    ) {
        User currentUser = getCurrentUser(authentication);
        bankAccountService.setDefaultBankAccount(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
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

