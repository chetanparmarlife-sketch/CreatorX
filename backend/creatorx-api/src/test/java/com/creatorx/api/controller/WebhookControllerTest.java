package com.creatorx.api.controller;

import com.creatorx.api.integration.BaseIntegrationTest;
import com.creatorx.common.enums.WithdrawalStatus;
import com.creatorx.repository.BankAccountRepository;
import com.creatorx.repository.WalletRepository;
import com.creatorx.repository.WebhookEventRepository;
import com.creatorx.repository.WithdrawalRequestRepository;
import com.creatorx.repository.entity.BankAccount;
import com.creatorx.repository.entity.Wallet;
import com.creatorx.repository.entity.WithdrawalRequest;
import com.creatorx.service.razorpay.RazorpayWebhookVerifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests for WebhookController
 * Phase 4: Real Money Payouts
 *
 * Test cases:
 * a) invalid signature => 401
 * b) duplicate webhook => 200 and no double processing/refund
 * c) payout.processed completes withdrawal
 * d) payout.failed refunds once
 */
@DisplayName("WebhookController Tests")
class WebhookControllerTest extends BaseIntegrationTest {

    @Autowired
    private WebhookEventRepository webhookEventRepository;

    @Autowired
    private WithdrawalRequestRepository withdrawalRequestRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @MockBean
    private RazorpayWebhookVerifier webhookVerifier;

    private static final String WEBHOOK_ENDPOINT = "/api/v1/webhooks/razorpay";
    private static final String VALID_SIGNATURE = "valid-signature";

    private WithdrawalRequest testWithdrawal;
    private Wallet testWallet;
    private BankAccount testBankAccount;

    @BeforeEach
    @Override
    public void setUpBaseTest() {
        super.setUpBaseTest();

        // Clear webhook events from previous tests
        webhookEventRepository.deleteAll();
        withdrawalRequestRepository.deleteAll();

        // Create test wallet for creator
        testWallet = Wallet.builder()
                .user(testCreator)
                .balance(new BigDecimal("5000.00"))
                .pendingBalance(BigDecimal.ZERO)
                .totalEarned(new BigDecimal("10000.00"))
                .totalWithdrawn(new BigDecimal("5000.00"))
                .build();
        testWallet = walletRepository.save(testWallet);

        // Create test bank account
        testBankAccount = BankAccount.builder()
                .user(testCreator)
                .accountHolderName("Test Creator")
                .accountNumber("1234567890")
                .ifscCode("HDFC0001234")
                .bankName("HDFC Bank")
                .verified(true)
                .isDefault(true)
                .build();
        testBankAccount = bankAccountRepository.save(testBankAccount);

        // Create test withdrawal in PROCESSING state
        testWithdrawal = WithdrawalRequest.builder()
                .user(testCreator)
                .amount(new BigDecimal("1000.00"))
                .bankAccount(testBankAccount)
                .status(WithdrawalStatus.PROCESSING)
                .razorpayPayoutId("pout_test_123456")
                .requestedAt(LocalDateTime.now())
                .build();
        testWithdrawal = withdrawalRequestRepository.save(testWithdrawal);

        // Default: mock verifier to accept valid signature
        when(webhookVerifier.verify(anyString(), anyString())).thenReturn(false);
        when(webhookVerifier.verify(anyString(), org.mockito.ArgumentMatchers.eq(VALID_SIGNATURE))).thenReturn(true);
    }

    @Nested
    @DisplayName("Signature Verification Tests")
    class SignatureVerificationTests {

        @Test
        @DisplayName("Missing signature header should return 401")
        void missingSignature_returns401() throws Exception {
            String payload = createWebhookPayload("evt_test_001", "payout.processed", testWithdrawal.getRazorpayPayoutId());

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isUnauthorized());

            // Verify no webhook event was stored
            assertThat(webhookEventRepository.existsByWebhookId("evt_test_001")).isFalse();
        }

        @Test
        @DisplayName("Invalid signature should return 401")
        void invalidSignature_returns401() throws Exception {
            String payload = createWebhookPayload("evt_test_002", "payout.processed", testWithdrawal.getRazorpayPayoutId());

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", "invalid-signature")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isUnauthorized());

            // Verify no webhook event was stored
            assertThat(webhookEventRepository.existsByWebhookId("evt_test_002")).isFalse();
        }

        @Test
        @DisplayName("Valid signature should return 200")
        void validSignature_returns200() throws Exception {
            String payload = createWebhookPayload("evt_test_003", "payout.processed", testWithdrawal.getRazorpayPayoutId());

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            // Verify webhook event was stored
            assertThat(webhookEventRepository.existsByWebhookId("evt_test_003")).isTrue();
        }
    }

    @Nested
    @DisplayName("Idempotency Tests")
    class IdempotencyTests {

        @Test
        @DisplayName("Duplicate webhook should return 200 without reprocessing")
        void duplicateWebhook_returns200_noReprocessing() throws Exception {
            String webhookId = "evt_test_duplicate";
            String payload = createWebhookPayload(webhookId, "payout.processed", testWithdrawal.getRazorpayPayoutId());

            // First request
            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            // Verify webhook stored
            assertThat(webhookEventRepository.existsByWebhookId(webhookId)).isTrue();

            // Second request with same webhook ID
            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            // Verify only one webhook event exists
            assertThat(webhookEventRepository.findAll().stream()
                    .filter(e -> e.getWebhookId().equals(webhookId))
                    .count()).isEqualTo(1);
        }

        @Test
        @DisplayName("Duplicate payout.failed should not cause double refund")
        void duplicateFailedWebhook_noDoubleRefund() throws Exception {
            // Get initial wallet balance
            BigDecimal initialBalance = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            String webhookId1 = "evt_test_failed_1";
            String payload1 = createFailedWebhookPayload(webhookId1, testWithdrawal.getRazorpayPayoutId(), "Bank rejected");

            // First failed webhook - should refund
            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload1))
                    .andExpect(status().isOk());

            // Check balance after first refund
            BigDecimal balanceAfterFirstRefund = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            assertThat(balanceAfterFirstRefund).isEqualByComparingTo(
                    initialBalance.add(testWithdrawal.getAmount()));

            // Second failed webhook with different event ID but same payout
            String webhookId2 = "evt_test_failed_2";
            String payload2 = createFailedWebhookPayload(webhookId2, testWithdrawal.getRazorpayPayoutId(), "Bank rejected again");

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload2))
                    .andExpect(status().isOk());

            // Verify balance hasn't changed (no double refund)
            BigDecimal finalBalance = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            assertThat(finalBalance).isEqualByComparingTo(balanceAfterFirstRefund);

            // Verify withdrawal has refundedAt set
            WithdrawalRequest updatedWithdrawal = withdrawalRequestRepository.findById(testWithdrawal.getId())
                    .orElseThrow();
            assertThat(updatedWithdrawal.getRefundedAt()).isNotNull();
        }
    }

    @Nested
    @DisplayName("payout.processed Tests")
    class PayoutProcessedTests {

        @Test
        @DisplayName("payout.processed should mark withdrawal as COMPLETED")
        void payoutProcessed_completesWithdrawal() throws Exception {
            String payload = createProcessedWebhookPayload(
                    "evt_processed_001",
                    testWithdrawal.getRazorpayPayoutId(),
                    testWithdrawal.getId(),
                    "UTR123456789"
            );

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            // Verify withdrawal status updated
            WithdrawalRequest updatedWithdrawal = withdrawalRequestRepository.findById(testWithdrawal.getId())
                    .orElseThrow();

            assertThat(updatedWithdrawal.getStatus()).isEqualTo(WithdrawalStatus.COMPLETED);
            assertThat(updatedWithdrawal.getUtr()).isEqualTo("UTR123456789");
            assertThat(updatedWithdrawal.getWebhookReceivedAt()).isNotNull();
            assertThat(updatedWithdrawal.getProcessedAt()).isNotNull();
        }

        @Test
        @DisplayName("payout.processed on FAILED withdrawal should be ignored")
        void payoutProcessed_ignoredForFailedWithdrawal() throws Exception {
            // Set withdrawal to FAILED
            testWithdrawal.setStatus(WithdrawalStatus.FAILED);
            testWithdrawal.setFailureReason("Previous failure");
            withdrawalRequestRepository.save(testWithdrawal);

            String payload = createProcessedWebhookPayload(
                    "evt_processed_002",
                    testWithdrawal.getRazorpayPayoutId(),
                    testWithdrawal.getId(),
                    "UTR999"
            );

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            // Verify withdrawal still FAILED (not resurrected to COMPLETED)
            WithdrawalRequest updatedWithdrawal = withdrawalRequestRepository.findById(testWithdrawal.getId())
                    .orElseThrow();

            assertThat(updatedWithdrawal.getStatus()).isEqualTo(WithdrawalStatus.FAILED);
            assertThat(updatedWithdrawal.getUtr()).isNull();
        }

        @Test
        @DisplayName("payout.processed with reference_id finds withdrawal by ID")
        void payoutProcessed_findsWithdrawalByReferenceId() throws Exception {
            // Create withdrawal without razorpayPayoutId
            WithdrawalRequest noPayoutIdWithdrawal = WithdrawalRequest.builder()
                    .user(testCreator)
                    .amount(new BigDecimal("500.00"))
                    .bankAccount(testBankAccount)
                    .status(WithdrawalStatus.PROCESSING)
                    .requestedAt(LocalDateTime.now())
                    .build();
            noPayoutIdWithdrawal = withdrawalRequestRepository.save(noPayoutIdWithdrawal);

            String payload = createProcessedWebhookPayload(
                    "evt_processed_003",
                    "pout_new_123", // This payout ID is not stored
                    noPayoutIdWithdrawal.getId(), // But reference_id matches withdrawal ID
                    "UTR_REF_001"
            );

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            // Verify withdrawal found and updated
            WithdrawalRequest updatedWithdrawal = withdrawalRequestRepository.findById(noPayoutIdWithdrawal.getId())
                    .orElseThrow();

            assertThat(updatedWithdrawal.getStatus()).isEqualTo(WithdrawalStatus.COMPLETED);
            assertThat(updatedWithdrawal.getUtr()).isEqualTo("UTR_REF_001");
        }
    }

    @Nested
    @DisplayName("payout.failed Tests")
    class PayoutFailedTests {

        @Test
        @DisplayName("payout.failed should refund and mark as FAILED")
        void payoutFailed_refundsAndFails() throws Exception {
            BigDecimal initialBalance = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            String payload = createFailedWebhookPayload(
                    "evt_failed_001",
                    testWithdrawal.getRazorpayPayoutId(),
                    "Insufficient funds in bank"
            );

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            // Verify withdrawal status
            WithdrawalRequest updatedWithdrawal = withdrawalRequestRepository.findById(testWithdrawal.getId())
                    .orElseThrow();

            assertThat(updatedWithdrawal.getStatus()).isEqualTo(WithdrawalStatus.FAILED);
            assertThat(updatedWithdrawal.getFailureReason()).isEqualTo("Insufficient funds in bank");
            assertThat(updatedWithdrawal.getRefundedAt()).isNotNull();
            assertThat(updatedWithdrawal.getWebhookReceivedAt()).isNotNull();

            // Verify wallet refunded
            BigDecimal finalBalance = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            assertThat(finalBalance).isEqualByComparingTo(
                    initialBalance.add(testWithdrawal.getAmount()));
        }

        @Test
        @DisplayName("payout.failed on COMPLETED withdrawal should be ignored")
        void payoutFailed_ignoredForCompletedWithdrawal() throws Exception {
            // Set withdrawal to COMPLETED
            testWithdrawal.setStatus(WithdrawalStatus.COMPLETED);
            testWithdrawal.setUtr("UTR_COMPLETED");
            withdrawalRequestRepository.save(testWithdrawal);

            BigDecimal initialBalance = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            String payload = createFailedWebhookPayload(
                    "evt_failed_002",
                    testWithdrawal.getRazorpayPayoutId(),
                    "Late failure"
            );

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            // Verify withdrawal still COMPLETED
            WithdrawalRequest updatedWithdrawal = withdrawalRequestRepository.findById(testWithdrawal.getId())
                    .orElseThrow();

            assertThat(updatedWithdrawal.getStatus()).isEqualTo(WithdrawalStatus.COMPLETED);

            // Verify no refund was made
            BigDecimal finalBalance = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            assertThat(finalBalance).isEqualByComparingTo(initialBalance);
        }
    }

    @Nested
    @DisplayName("payout.reversed Tests")
    class PayoutReversedTests {

        @Test
        @DisplayName("payout.reversed should refund COMPLETED withdrawal")
        void payoutReversed_refundsCompletedWithdrawal() throws Exception {
            // Set withdrawal to COMPLETED (normal case for reversal)
            testWithdrawal.setStatus(WithdrawalStatus.COMPLETED);
            testWithdrawal.setUtr("UTR_TO_REVERSE");
            withdrawalRequestRepository.save(testWithdrawal);

            BigDecimal initialBalance = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            String payload = createReversedWebhookPayload(
                    "evt_reversed_001",
                    testWithdrawal.getRazorpayPayoutId()
            );

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            // Verify withdrawal status
            WithdrawalRequest updatedWithdrawal = withdrawalRequestRepository.findById(testWithdrawal.getId())
                    .orElseThrow();

            assertThat(updatedWithdrawal.getStatus()).isEqualTo(WithdrawalStatus.FAILED);
            assertThat(updatedWithdrawal.getFailureReason()).isEqualTo("Payout reversed by bank");
            assertThat(updatedWithdrawal.getRefundedAt()).isNotNull();

            // Verify wallet refunded
            BigDecimal finalBalance = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            assertThat(finalBalance).isEqualByComparingTo(
                    initialBalance.add(testWithdrawal.getAmount()));
        }

        @Test
        @DisplayName("payout.reversed on FAILED withdrawal should be ignored")
        void payoutReversed_ignoredForFailedWithdrawal() throws Exception {
            // Set withdrawal to FAILED (already handled)
            testWithdrawal.setStatus(WithdrawalStatus.FAILED);
            testWithdrawal.setFailureReason("Already failed");
            testWithdrawal.setRefundedAt(LocalDateTime.now()); // Already refunded
            withdrawalRequestRepository.save(testWithdrawal);

            BigDecimal initialBalance = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            String payload = createReversedWebhookPayload(
                    "evt_reversed_002",
                    testWithdrawal.getRazorpayPayoutId()
            );

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            // Verify no refund (balance unchanged)
            BigDecimal finalBalance = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            assertThat(finalBalance).isEqualByComparingTo(initialBalance);
        }
    }

    // Helper methods to create webhook payloads

    private String createWebhookPayload(String webhookId, String eventType, String payoutId) {
        return String.format("""
            {
                "id": "%s",
                "event": "%s",
                "payload": {
                    "payout": {
                        "entity": {
                            "id": "%s",
                            "amount": 100000,
                            "status": "%s"
                        }
                    }
                }
            }
            """, webhookId, eventType, payoutId,
            eventType.equals("payout.processed") ? "processed" : "failed");
    }

    private String createProcessedWebhookPayload(String webhookId, String payoutId, String referenceId, String utr) {
        return String.format("""
            {
                "id": "%s",
                "event": "payout.processed",
                "payload": {
                    "payout": {
                        "entity": {
                            "id": "%s",
                            "reference_id": "%s",
                            "amount": 100000,
                            "status": "processed",
                            "utr": "%s"
                        }
                    }
                }
            }
            """, webhookId, payoutId, referenceId, utr);
    }

    private String createFailedWebhookPayload(String webhookId, String payoutId, String failureReason) {
        return String.format("""
            {
                "id": "%s",
                "event": "payout.failed",
                "payload": {
                    "payout": {
                        "entity": {
                            "id": "%s",
                            "amount": 100000,
                            "status": "failed",
                            "failure_reason": "%s"
                        }
                    }
                }
            }
            """, webhookId, payoutId, failureReason);
    }

    private String createReversedWebhookPayload(String webhookId, String payoutId) {
        return String.format("""
            {
                "id": "%s",
                "event": "payout.reversed",
                "payload": {
                    "payout": {
                        "entity": {
                            "id": "%s",
                            "amount": 100000,
                            "status": "reversed"
                        }
                    }
                }
            }
            """, webhookId, payoutId);
    }
}
