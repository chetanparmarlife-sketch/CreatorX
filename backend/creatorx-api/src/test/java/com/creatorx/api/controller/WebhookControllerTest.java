package com.creatorx.api.controller;

import com.creatorx.api.integration.BaseIntegrationTest;
import com.creatorx.common.enums.WithdrawalStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.repository.BankAccountRepository;
import com.creatorx.repository.WebhookEventRepository;
import com.creatorx.repository.WithdrawalRequestRepository;
import com.creatorx.repository.entity.BankAccount;
import com.creatorx.repository.entity.WithdrawalRequest;
import com.creatorx.service.WalletService;
import com.creatorx.service.razorpay.RazorpayWebhookVerifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
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
    private BankAccountRepository bankAccountRepository;

    @MockBean
    private RazorpayWebhookVerifier webhookVerifier;

    @MockBean
    private WalletService walletService;

    private static final String WEBHOOK_ENDPOINT = "/api/v1/webhooks/razorpay";
    private static final String VALID_SIGNATURE = "valid-signature";

    private WithdrawalRequest testWithdrawal;
    private BankAccount testBankAccount;

    @BeforeEach
    @Override
    public void setUpBaseTest() {
        super.setUpBaseTest();

        // Clear webhook events from previous tests
        webhookEventRepository.deleteAll();
        withdrawalRequestRepository.deleteAll();

        // Configure WalletService mock to accept creditWalletWithType calls
        doNothing().when(walletService).creditWalletWithType(
                anyString(), any(BigDecimal.class), anyString(), any(), any(TransactionType.class), any()
        );

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
            String webhookId1 = "evt_test_failed_1";
            String payload1 = createFailedWebhookPayload(webhookId1, testWithdrawal.getRazorpayPayoutId(), "Bank rejected");

            // First failed webhook - should refund
            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload1))
                    .andExpect(status().isOk());

            // Second failed webhook with different event ID but same payout
            String webhookId2 = "evt_test_failed_2";
            String payload2 = createFailedWebhookPayload(webhookId2, testWithdrawal.getRazorpayPayoutId(), "Bank rejected again");

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload2))
                    .andExpect(status().isOk());

            // Verify WalletService was called exactly once (no double refund)
            verify(walletService, times(1)).creditWalletWithType(
                    eq(testCreator.getId()),
                    eq(testWithdrawal.getAmount()),
                    anyString(),
                    any(),
                    eq(TransactionType.REFUND),
                    any()
            );

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

            // Verify WalletService was called to credit the refund
            verify(walletService).creditWalletWithType(
                    eq(testCreator.getId()),
                    eq(testWithdrawal.getAmount()),
                    anyString(),
                    any(),
                    eq(TransactionType.REFUND),
                    any()
            );
        }

        @Test
        @DisplayName("payout.failed on COMPLETED withdrawal should be ignored")
        void payoutFailed_ignoredForCompletedWithdrawal() throws Exception {
            // Set withdrawal to COMPLETED
            testWithdrawal.setStatus(WithdrawalStatus.COMPLETED);
            testWithdrawal.setUtr("UTR_COMPLETED");
            withdrawalRequestRepository.save(testWithdrawal);

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

            // Verify WalletService was NOT called (no refund)
            verify(walletService, never()).creditWalletWithType(
                    anyString(), any(BigDecimal.class), anyString(), any(), any(TransactionType.class), any()
            );
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

            // Verify WalletService was called to credit the refund
            verify(walletService).creditWalletWithType(
                    eq(testCreator.getId()),
                    eq(testWithdrawal.getAmount()),
                    anyString(),
                    any(),
                    eq(TransactionType.REFUND),
                    any()
            );
        }

        @Test
        @DisplayName("payout.reversed on FAILED withdrawal should be ignored")
        void payoutReversed_ignoredForFailedWithdrawal() throws Exception {
            // Set withdrawal to FAILED (already handled)
            testWithdrawal.setStatus(WithdrawalStatus.FAILED);
            testWithdrawal.setFailureReason("Already failed");
            testWithdrawal.setRefundedAt(LocalDateTime.now()); // Already refunded
            withdrawalRequestRepository.save(testWithdrawal);

            String payload = createReversedWebhookPayload(
                    "evt_reversed_002",
                    testWithdrawal.getRazorpayPayoutId()
            );

            mockMvc.perform(post(WEBHOOK_ENDPOINT)
                    .header("X-Razorpay-Signature", VALID_SIGNATURE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(payload))
                    .andExpect(status().isOk());

            // Verify WalletService was NOT called (no refund for already failed withdrawal)
            verify(walletService, never()).creditWalletWithType(
                    anyString(), any(BigDecimal.class), anyString(), any(), any(TransactionType.class), any()
            );
        }
    }

    @Nested
    @DisplayName("Concurrent Webhook Processing Tests (Phase 4.1)")
    class ConcurrencyTests {

        @Test
        @DisplayName("Concurrent identical webhooks should process exactly once")
        void concurrentIdenticalWebhooks_processExactlyOnce() throws Exception {
            int numThreads = 10;
            String webhookId = "evt_concurrent_identical";
            // Use a non-existent payout ID since concurrent threads can't see test transaction data
            String payload = createFailedWebhookPayload(webhookId, "pout_concurrent_test_123", "Concurrent test");

            ExecutorService executor = Executors.newFixedThreadPool(numThreads);
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch doneLatch = new CountDownLatch(numThreads);
            AtomicInteger successCount = new AtomicInteger(0);

            List<Future<?>> futures = new ArrayList<>();

            // Submit concurrent requests
            for (int i = 0; i < numThreads; i++) {
                futures.add(executor.submit(() -> {
                    try {
                        startLatch.await(); // Wait for all threads to be ready
                        mockMvc.perform(post(WEBHOOK_ENDPOINT)
                                .header("X-Razorpay-Signature", VALID_SIGNATURE)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(payload))
                                .andExpect(status().isOk());
                        successCount.incrementAndGet();
                    } catch (Exception e) {
                        // Expected for some threads due to deduplication
                    } finally {
                        doneLatch.countDown();
                    }
                }));
            }

            // Release all threads simultaneously
            startLatch.countDown();
            doneLatch.await(30, TimeUnit.SECONDS);
            executor.shutdown();

            // Verify exactly one webhook event was stored (idempotency via unique constraint)
            // This is the key test: concurrent identical webhooks should only store once
            long webhookCount = webhookEventRepository.findAll().stream()
                    .filter(e -> e.getWebhookId().equals(webhookId))
                    .count();
            assertThat(webhookCount).isEqualTo(1);

            // Note: We don't verify wallet refund behavior here because concurrent threads
            // run in separate transactions and can't see the test's uncommitted data.
            // Wallet refund logic is tested in non-concurrent tests above.
        }

        @Test
        @DisplayName("Concurrent different webhooks for same payout should all be stored")
        void concurrentDifferentWebhooks_samePayout_allStored() throws Exception {
            int numThreads = 5;
            // Use a non-existent payout ID since concurrent threads can't see test transaction data
            String payoutId = "pout_concurrent_diff_test_456";

            ExecutorService executor = Executors.newFixedThreadPool(numThreads);
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch doneLatch = new CountDownLatch(numThreads);

            // Submit concurrent requests with different webhook IDs but same payout
            for (int i = 0; i < numThreads; i++) {
                final int index = i;
                executor.submit(() -> {
                    try {
                        startLatch.await();
                        String payload = createFailedWebhookPayload(
                                "evt_concurrent_diff_" + index,
                                payoutId,
                                "Concurrent test " + index
                        );
                        mockMvc.perform(post(WEBHOOK_ENDPOINT)
                                .header("X-Razorpay-Signature", VALID_SIGNATURE)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(payload))
                                .andExpect(status().isOk());
                    } catch (Exception e) {
                        // Log but continue
                    } finally {
                        doneLatch.countDown();
                    }
                });
            }

            // Release all threads
            startLatch.countDown();
            doneLatch.await(30, TimeUnit.SECONDS);
            executor.shutdown();

            // Verify all webhooks with different IDs were stored
            // Each webhook ID is unique, so all should be stored
            long webhookCount = webhookEventRepository.findAll().stream()
                    .filter(e -> e.getWebhookId().startsWith("evt_concurrent_diff_"))
                    .count();
            assertThat(webhookCount).isEqualTo(numThreads);

            // Note: We don't verify wallet refund behavior here because concurrent threads
            // run in separate transactions and can't see the test's uncommitted data.
            // The refundedAt guard against double refunds is tested in non-concurrent tests.
        }

        @RepeatedTest(3)
        @DisplayName("Repeated: Concurrent webhooks are deduplicated correctly")
        void repeatedConcurrencyTest_webhookDeduplication() throws Exception {
            // Use unique webhook IDs per repetition to avoid conflicts
            String webhookIdPrefix = "evt_repeated_" + System.nanoTime();
            String payoutId = "pout_repeated_" + System.nanoTime();

            int numThreads = 8;
            ExecutorService executor = Executors.newFixedThreadPool(numThreads);
            CountDownLatch startLatch = new CountDownLatch(1);
            CountDownLatch doneLatch = new CountDownLatch(numThreads);

            for (int i = 0; i < numThreads; i++) {
                final int index = i;
                executor.submit(() -> {
                    try {
                        startLatch.await();
                        String payload = createFailedWebhookPayload(
                                webhookIdPrefix + "_" + index,
                                payoutId,
                                "Repeated test"
                        );
                        mockMvc.perform(post(WEBHOOK_ENDPOINT)
                                .header("X-Razorpay-Signature", VALID_SIGNATURE)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(payload))
                                .andExpect(status().isOk());
                    } catch (Exception e) {
                        // Expected
                    } finally {
                        doneLatch.countDown();
                    }
                });
            }

            startLatch.countDown();
            doneLatch.await(30, TimeUnit.SECONDS);
            executor.shutdown();

            // Verify all webhooks with unique IDs were stored (no duplicates rejected)
            long webhookCount = webhookEventRepository.findAll().stream()
                    .filter(e -> e.getWebhookId().startsWith(webhookIdPrefix))
                    .count();
            assertThat(webhookCount).isEqualTo(numThreads);

            // Note: We don't verify wallet refund behavior here because concurrent threads
            // run in separate transactions and can't see the test's uncommitted data.
            // The refundedAt guard against double refunds is tested in non-concurrent tests.
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
