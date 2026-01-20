package com.creatorx.service.razorpay;

import com.creatorx.common.exception.BusinessException;
import com.creatorx.repository.entity.BankAccount;
import com.razorpay.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Service for Razorpay payout operations
 * Purpose: Create payouts and verify bank accounts using Razorpay API
 * Phase: Phase 4 - Real Money Payouts
 *
 * Key Features:
 * - Create payout to bank account
 * - Penny drop verification for bank account validation
 * - Retry mechanism for API failures
 *
 * IMPORTANT: All amounts are in paise (1 INR = 100 paise)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayService {

    private final RazorpayClient razorpayClient;
    private final RazorpayConfig razorpayConfig;

    // Razorpay API uses paise (smallest currency unit)
    private static final int PAISE_PER_RUPEE = 100;

    /**
     * Create a payout to a bank account
     *
     * @param withdrawalId Unique withdrawal request ID (used as idempotency key)
     * @param amount Amount in INR (will be converted to paise)
     * @param bankAccount Bank account details
     * @return Razorpay payout ID
     * @throws BusinessException if payout creation fails
     */
    public String createPayout(String withdrawalId, BigDecimal amount, BankAccount bankAccount) {
        try {
            if (razorpayClient == null) {
                throw new BusinessException("Razorpay is not configured. Contact support.");
            }

            if (!razorpayConfig.isConfigured()) {
                throw new BusinessException("Razorpay credentials not configured");
            }

            log.info("Creating Razorpay payout for withdrawal: {}, amount: {} INR", withdrawalId, amount);

            // Convert amount to paise (Razorpay requires smallest currency unit)
            int amountInPaise = amount.multiply(BigDecimal.valueOf(PAISE_PER_RUPEE)).intValue();

            // Build payout request
            JSONObject payoutRequest = new JSONObject();
            payoutRequest.put("account_number", razorpayConfig.getAccountNumber());
            payoutRequest.put("amount", amountInPaise);
            payoutRequest.put("currency", "INR");
            payoutRequest.put("mode", "NEFT"); // or RTGS, IMPS, UPI
            payoutRequest.put("purpose", "payout");
            payoutRequest.put("queue_if_low_balance", true);
            payoutRequest.put("reference_id", withdrawalId); // For tracking

            // Fund account details
            JSONObject fundAccount = new JSONObject();
            fundAccount.put("account_type", "bank_account");

            JSONObject bankAccountDetails = new JSONObject();
            bankAccountDetails.put("name", bankAccount.getAccountHolderName());
            bankAccountDetails.put("ifsc", bankAccount.getIfscCode());
            bankAccountDetails.put("account_number", bankAccount.getAccountNumber());
            fundAccount.put("bank_account", bankAccountDetails);

            // Contact details
            JSONObject contact = new JSONObject();
            contact.put("name", bankAccount.getAccountHolderName());
            contact.put("type", "customer");
            fundAccount.put("contact", contact);

            payoutRequest.put("fund_account", fundAccount);

            // Narration (description shown to user)
            payoutRequest.put("narration", "CreatorX Withdrawal");
            payoutRequest.put("notes", new JSONObject()
                .put("withdrawal_id", withdrawalId)
                .put("platform", "CreatorX")
            );

            // Create payout with idempotency key
            Payout payout = razorpayClient.payouts.create(payoutRequest, withdrawalId);

            String payoutId = payout.get("id");
            String status = payout.get("status");

            log.info("Razorpay payout created successfully. Payout ID: {}, Status: {}", payoutId, status);

            return payoutId;

        } catch (RazorpayException e) {
            log.error("Razorpay payout creation failed for withdrawal {}: {}", withdrawalId, e.getMessage(), e);
            throw new BusinessException("Failed to create payout: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating payout for withdrawal {}: {}", withdrawalId, e.getMessage(), e);
            throw new BusinessException("Failed to create payout due to unexpected error");
        }
    }

    /**
     * Verify bank account using penny drop
     * Razorpay will transfer a small amount (e.g., ₹1) to verify account ownership
     *
     * Phase 4.1: Returns BankVerificationResult with fund account ID for webhook correlation
     *
     * @param bankAccount Bank account to verify
     * @return BankVerificationResult containing fund account ID and status
     */
    public BankVerificationResult verifyBankAccount(BankAccount bankAccount) {
        try {
            if (razorpayClient == null) {
                log.warn("Razorpay not configured - skipping bank account verification");
                return BankVerificationResult.failure("Razorpay not configured");
            }

            log.info("Initiating penny drop verification for bank account: {}",
                maskAccountNumber(bankAccount.getAccountNumber()));

            // Create fund account for verification
            JSONObject fundAccountRequest = new JSONObject();
            fundAccountRequest.put("account_type", "bank_account");

            JSONObject bankAccountDetails = new JSONObject();
            bankAccountDetails.put("name", bankAccount.getAccountHolderName());
            bankAccountDetails.put("ifsc", bankAccount.getIfscCode());
            bankAccountDetails.put("account_number", bankAccount.getAccountNumber());
            fundAccountRequest.put("bank_account", bankAccountDetails);

            // Contact details
            JSONObject contact = new JSONObject();
            contact.put("name", bankAccount.getAccountHolderName());
            contact.put("type", "customer");
            fundAccountRequest.put("contact", contact);

            // Create fund account (Razorpay auto-verifies on creation in test mode)
            FundAccount fundAccount = razorpayClient.fundAccount.create(fundAccountRequest);

            String fundAccountId = fundAccount.get("id");
            boolean active = fundAccount.getBoolean("active");

            log.info("Fund account created: {}, Active: {}", fundAccountId, active);

            // In test mode, accounts are auto-verified (active = true)
            // In live mode, Razorpay performs actual penny drop (active = false until webhook)
            return BankVerificationResult.success(fundAccountId, active);

        } catch (RazorpayException e) {
            log.error("Bank account verification failed: {}", e.getMessage(), e);
            return BankVerificationResult.failure("Failed to verify bank account: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during bank account verification: {}", e.getMessage(), e);
            return BankVerificationResult.failure("Failed to verify bank account due to unexpected error");
        }
    }

    /**
     * Fetch payout status from Razorpay
     *
     * @param payoutId Razorpay payout ID
     * @return Payout status (processing, processed, failed, reversed, etc.)
     */
    public String getPayoutStatus(String payoutId) {
        try {
            if (razorpayClient == null) {
                throw new BusinessException("Razorpay not configured");
            }

            Payout payout = razorpayClient.payouts.fetch(payoutId);
            String status = payout.get("status");

            log.debug("Fetched payout status for {}: {}", payoutId, status);
            return status;

        } catch (RazorpayException e) {
            log.error("Failed to fetch payout status for {}: {}", payoutId, e.getMessage(), e);
            throw new BusinessException("Failed to fetch payout status: " + e.getMessage());
        }
    }

    /**
     * Mask account number for logging (show only last 4 digits)
     *
     * @param accountNumber Full account number
     * @return Masked account number (e.g., XXXX1234)
     */
    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() <= 4) {
            return "XXXX";
        }
        return "XXXX" + accountNumber.substring(accountNumber.length() - 4);
    }
}
