package com.creatorx.service.razorpay;

import com.creatorx.common.exception.BusinessException;
import com.creatorx.repository.entity.BankAccount;
import com.razorpay.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Service for Razorpay payout operations
 * Purpose: Create payouts and verify bank accounts using Razorpay API
 * Phase: Phase 4 - Real Money Payouts
 *
 * Key Features:
 * - Create payout to bank account via RazorpayX API
 * - Penny drop verification for bank account validation
 * - Retry mechanism for API failures
 *
 * IMPORTANT: All amounts are in paise (1 INR = 100 paise)
 * 
 * Note: RazorpayX Payouts API is not available in the standard Razorpay Java
 * SDK.
 * This service uses REST API calls directly for payout operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayService {

    private final RazorpayClient razorpayClient;
    private final RazorpayConfig razorpayConfig;
    private final RestTemplate restTemplate;

    // Razorpay API uses paise (smallest currency unit)
    private static final int PAISE_PER_RUPEE = 100;

    // RazorpayX API endpoints
    private static final String RAZORPAYX_BASE_URL = "https://api.razorpay.com/v1";
    private static final String PAYOUTS_ENDPOINT = RAZORPAYX_BASE_URL + "/payouts";
    private static final String FUND_ACCOUNTS_ENDPOINT = RAZORPAYX_BASE_URL + "/fund_accounts";
    private static final String CONTACTS_ENDPOINT = RAZORPAYX_BASE_URL + "/contacts";

    /**
     * Create a payout to a bank account
     *
     * @param withdrawalId Unique withdrawal request ID (used as idempotency key)
     * @param amount       Amount in INR (will be converted to paise)
     * @param bankAccount  Bank account details
     * @return Razorpay payout ID
     * @throws BusinessException if payout creation fails
     */
    public String createPayout(String withdrawalId, BigDecimal amount, BankAccount bankAccount) {
        try {
            if (!razorpayConfig.isConfigured()) {
                throw new BusinessException("Razorpay credentials not configured");
            }

            log.info("Creating Razorpay payout for withdrawal: {}, amount: {} INR", withdrawalId, amount);

            // Convert amount to paise (Razorpay requires smallest currency unit)
            int amountInPaise = amount.multiply(BigDecimal.valueOf(PAISE_PER_RUPEE)).intValue();

            // First, create a contact
            String contactId = createContact(bankAccount);

            // Then create a fund account for the contact
            String fundAccountId = createFundAccountForPayout(contactId, bankAccount);

            // Build payout request
            JSONObject payoutRequest = new JSONObject();
            payoutRequest.put("account_number", razorpayConfig.getAccountNumber());
            payoutRequest.put("fund_account_id", fundAccountId);
            payoutRequest.put("amount", amountInPaise);
            payoutRequest.put("currency", "INR");
            payoutRequest.put("mode", "NEFT"); // or RTGS, IMPS, UPI
            payoutRequest.put("purpose", "payout");
            payoutRequest.put("queue_if_low_balance", true);
            payoutRequest.put("reference_id", withdrawalId); // For tracking
            payoutRequest.put("narration", "CreatorX Withdrawal");
            payoutRequest.put("notes", new JSONObject()
                    .put("withdrawal_id", withdrawalId)
                    .put("platform", "CreatorX"));

            // Create payout via REST API
            HttpHeaders headers = createAuthHeaders();
            headers.add("X-Payout-Idempotency", withdrawalId);

            HttpEntity<String> entity = new HttpEntity<>(payoutRequest.toString(), headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    PAYOUTS_ENDPOINT,
                    HttpMethod.POST,
                    entity,
                    String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new BusinessException("Failed to create payout: " + response.getBody());
            }

            JSONObject payout = new JSONObject(response.getBody());
            String payoutId = payout.getString("id");
            String status = payout.getString("status");

            log.info("Razorpay payout created successfully. Payout ID: {}, Status: {}", payoutId, status);

            return payoutId;

        } catch (RestClientException e) {
            log.error("Razorpay payout creation failed for withdrawal {}: {}", withdrawalId, e.getMessage(), e);
            throw new BusinessException("Failed to create payout: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error creating payout for withdrawal {}: {}", withdrawalId, e.getMessage(), e);
            throw new BusinessException("Failed to create payout due to unexpected error");
        }
    }

    /**
     * Create a contact in RazorpayX
     * Required before creating a fund account for payouts
     */
    private String createContact(BankAccount bankAccount) {
        JSONObject contactRequest = new JSONObject();
        contactRequest.put("name", bankAccount.getAccountHolderName());
        contactRequest.put("type", "customer");
        contactRequest.put("reference_id", bankAccount.getId());

        HttpEntity<String> entity = new HttpEntity<>(contactRequest.toString(), createAuthHeaders());

        ResponseEntity<String> response = restTemplate.exchange(
                CONTACTS_ENDPOINT,
                HttpMethod.POST,
                entity,
                String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new BusinessException("Failed to create contact: " + response.getBody());
        }

        JSONObject contact = new JSONObject(response.getBody());
        return contact.getString("id");
    }

    /**
     * Create a fund account for payout (RazorpayX API)
     * This is different from the Payment Gateway fund account
     */
    private String createFundAccountForPayout(String contactId, BankAccount bankAccount) {
        JSONObject fundAccountRequest = new JSONObject();
        fundAccountRequest.put("contact_id", contactId);
        fundAccountRequest.put("account_type", "bank_account");

        JSONObject bankAccountDetails = new JSONObject();
        bankAccountDetails.put("name", bankAccount.getAccountHolderName());
        bankAccountDetails.put("ifsc", bankAccount.getIfscCode());
        bankAccountDetails.put("account_number", bankAccount.getAccountNumber());
        fundAccountRequest.put("bank_account", bankAccountDetails);

        HttpEntity<String> entity = new HttpEntity<>(fundAccountRequest.toString(), createAuthHeaders());

        ResponseEntity<String> response = restTemplate.exchange(
                FUND_ACCOUNTS_ENDPOINT,
                HttpMethod.POST,
                entity,
                String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new BusinessException("Failed to create fund account: " + response.getBody());
        }

        JSONObject fundAccount = new JSONObject(response.getBody());
        return fundAccount.getString("id");
    }

    /**
     * Verify bank account using penny drop
     * Razorpay will transfer a small amount (e.g., ₹1) to verify account ownership
     *
     * Phase 4.1: Returns BankVerificationResult with fund account ID for webhook
     * correlation
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

            // For bank account verification via Payment Gateway SDK
            // This uses the customer fund account API (different from RazorpayX)
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

            // Create fund account using SDK (lowercase fundAccount)
            FundAccount fundAccount = razorpayClient.fundAccount.create(fundAccountRequest);

            String fundAccountId = fundAccount.get("id");
            boolean active = fundAccount.has("active") && Boolean.TRUE.equals(fundAccount.get("active"));

            log.info("Fund account created: {}, Active: {}", fundAccountId, active);

            // In test mode, accounts are auto-verified (active = true)
            // In live mode, Razorpay performs actual penny drop (active = false until
            // webhook)
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
            if (!razorpayConfig.isConfigured()) {
                throw new BusinessException("Razorpay not configured");
            }

            HttpEntity<String> entity = new HttpEntity<>(createAuthHeaders());

            ResponseEntity<String> response = restTemplate.exchange(
                    PAYOUTS_ENDPOINT + "/" + payoutId,
                    HttpMethod.GET,
                    entity,
                    String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new BusinessException("Failed to fetch payout status: " + response.getBody());
            }

            JSONObject payout = new JSONObject(response.getBody());
            String status = payout.getString("status");

            log.debug("Fetched payout status for {}: {}", payoutId, status);
            return status;

        } catch (RestClientException e) {
            log.error("Failed to fetch payout status for {}: {}", payoutId, e.getMessage(), e);
            throw new BusinessException("Failed to fetch payout status: " + e.getMessage());
        }
    }

    /**
     * Create HTTP headers with Basic Auth for RazorpayX API
     */
    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String auth = razorpayConfig.getKeyId() + ":" + razorpayConfig.getKeySecret();
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
        headers.add("Authorization", "Basic " + encodedAuth);

        return headers;
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
