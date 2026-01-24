package com.creatorx.api.security;

import com.creatorx.api.integration.BaseIntegrationTest;
import com.creatorx.repository.BankAccountRepository;
import com.creatorx.repository.IdempotencyKeyRepository;
import com.creatorx.repository.WalletRepository;
import com.creatorx.repository.entity.BankAccount;
import com.creatorx.repository.entity.IdempotencyKey;
import com.creatorx.repository.entity.Wallet;
import com.creatorx.service.razorpay.RazorpayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests for IdempotencyFilter
 * Phase 4: Real Money Payouts
 *
 * Test cases:
 * a) Missing idempotency key => passthrough (no caching)
 * b) Cached response => return cached response immediately
 * c) New request => process and cache 2xx responses
 * d) Non-idempotent endpoints => passthrough
 * e) Primary header "Idempotency-Key" works
 * f) Legacy header "Idempotent-Key" works (backwards compatibility)
 * g) Non-2xx responses => not cached
 */
@DisplayName("IdempotencyFilter Tests")
class IdempotencyFilterTest extends BaseIntegrationTest {

    @Autowired
    private IdempotencyKeyRepository idempotencyKeyRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @MockBean
    private RazorpayService razorpayService;

    private static final String WITHDRAW_ENDPOINT = "/api/v1/wallet/withdraw";
    private static final String BANK_ACCOUNTS_ENDPOINT = "/api/v1/wallet/bank-accounts";

    private Wallet testWallet;
    private BankAccount testBankAccount;

    @BeforeEach
    @Override
    public void setUpBaseTest() {
        super.setUpBaseTest();

        // Clear idempotency keys from previous tests
        idempotencyKeyRepository.deleteAll();

        // Create test wallet with sufficient balance
        testWallet = walletRepository.findByUserId(testCreator.getId()).orElse(null);
        if (testWallet == null) {
            testWallet = Wallet.builder()
                    .user(testCreator)
                    .balance(new BigDecimal("10000.00"))
                    .pendingBalance(BigDecimal.ZERO)
                    .totalEarned(new BigDecimal("10000.00"))
                    .totalWithdrawn(BigDecimal.ZERO)
                    .build();
            testWallet = walletRepository.save(testWallet);
        } else {
            testWallet.setBalance(new BigDecimal("10000.00"));
            testWallet = walletRepository.save(testWallet);
        }

        // Create verified bank account
        testBankAccount = BankAccount.builder()
                .user(testCreator)
                .accountHolderName("Test Creator")
                .accountNumber("1234567890123")
                .ifscCode("HDFC0001234")
                .bankName("HDFC Bank")
                .verified(true)
                .isDefault(true)
                .build();
        testBankAccount = bankAccountRepository.save(testBankAccount);

        // Mock Razorpay service (disabled by default)
        when(razorpayService.createPayout(any(), any(), any())).thenReturn("pout_test_123");
        when(razorpayService.verifyBankAccount(any())).thenReturn(
                com.creatorx.service.razorpay.BankVerificationResult.success("fa_test123", true));

        // Authenticate as creator
        authenticateAsCreator();
    }

    @Nested
    @DisplayName("Header Acceptance Tests")
    class HeaderAcceptanceTests {

        @Test
        @DisplayName("Primary header Idempotency-Key should be accepted")
        void primaryIdempotencyKeyHeader_accepted() throws Exception {
            String idempotencyKey = "test-key-001";

            mockMvc.perform(post(WITHDRAW_ENDPOINT)
                    .header("Idempotency-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createWithdrawRequest(testBankAccount.getId(), "500.00")))
                    .andExpect(status().isOk());

            // Verify idempotency key was stored
            assertThat(idempotencyKeyRepository.findByKey(idempotencyKey)).isPresent();
        }

        @Test
        @DisplayName("Legacy header Idempotent-Key should be accepted for backwards compatibility")
        void legacyIdempotentKeyHeader_accepted() throws Exception {
            String idempotencyKey = "test-key-002";

            // Using legacy header name - should still work for backwards compatibility
            mockMvc.perform(post(WITHDRAW_ENDPOINT)
                    .header("Idempotent-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createWithdrawRequest(testBankAccount.getId(), "500.00")))
                    .andExpect(status().isOk());

            // Verify idempotency key was stored
            assertThat(idempotencyKeyRepository.findByKey(idempotencyKey)).isPresent();
        }
    }

    @Nested
    @DisplayName("Passthrough Tests")
    class PassthroughTests {

        @Test
        @DisplayName("Missing idempotency key should passthrough")
        void missingKey_passthrough() throws Exception {
            mockMvc.perform(post(WITHDRAW_ENDPOINT)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createWithdrawRequest(testBankAccount.getId(), "500.00")))
                    .andExpect(status().isOk());

            // Verify no idempotency key stored
            assertThat(idempotencyKeyRepository.count()).isEqualTo(0);
        }

        @Test
        @DisplayName("Non-POST requests should passthrough")
        void nonPostRequest_passthrough() throws Exception {
            // GET request to wallet (not idempotent endpoint)
            mockMvc.perform(get("/api/v1/wallet")
                    .header("Idempotency-Key", "test-key-get"))
                    .andExpect(status().isOk());

            // Verify no idempotency key stored
            assertThat(idempotencyKeyRepository.findByKey("test-key-get")).isEmpty();
        }

        @Test
        @DisplayName("Non-idempotent endpoint should passthrough")
        void nonIdempotentEndpoint_passthrough() throws Exception {
            // POST to a non-idempotent endpoint (campaigns)
            authenticateAsBrand();
            mockMvc.perform(post("/api/v1/campaigns")
                    .header("Idempotency-Key", "test-key-campaigns")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createCampaignRequest()))
                    .andExpect(status().isCreated());

            // Verify no idempotency key stored (campaigns not in idempotent list)
            assertThat(idempotencyKeyRepository.findByKey("test-key-campaigns")).isEmpty();
        }
    }

    @Nested
    @DisplayName("Cache Tests")
    class CacheTests {

        @Test
        @DisplayName("Cached response should be returned for duplicate request")
        void cachedResponse_returnedForDuplicate() throws Exception {
            String idempotencyKey = "test-key-duplicate";

            // First request
            mockMvc.perform(post(WITHDRAW_ENDPOINT)
                    .header("Idempotency-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createWithdrawRequest(testBankAccount.getId(), "500.00")))
                    .andExpect(status().isOk());

            // Get initial balance after first withdrawal
            BigDecimal balanceAfterFirst = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            // Second request with same key - should return cached response
            mockMvc.perform(post(WITHDRAW_ENDPOINT)
                    .header("Idempotency-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createWithdrawRequest(testBankAccount.getId(), "500.00")))
                    .andExpect(status().isOk());

            // Verify balance hasn't changed (no double withdrawal)
            BigDecimal balanceAfterSecond = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            assertThat(balanceAfterSecond).isEqualByComparingTo(balanceAfterFirst);

            // Verify only one idempotency key entry
            assertThat(idempotencyKeyRepository.findAll().stream()
                    .filter(k -> k.getKey().equals(idempotencyKey))
                    .count()).isEqualTo(1);
        }

        @Test
        @DisplayName("Expired cache should not be returned")
        void expiredCache_notReturned() throws Exception {
            String idempotencyKey = "test-key-expired";

            // Manually insert an expired idempotency key
            IdempotencyKey expiredKey = IdempotencyKey.builder()
                    .key(idempotencyKey)
                    .responseStatusCode(200)
                    .responseBody("{\"id\":\"old-withdrawal\"}")
                    .contentType(MediaType.APPLICATION_JSON_VALUE)
                    .expiresAt(LocalDateTime.now().minusHours(1)) // Expired
                    .build();
            idempotencyKeyRepository.save(expiredKey);

            // Request with expired key - should process new request
            mockMvc.perform(post(WITHDRAW_ENDPOINT)
                    .header("Idempotency-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createWithdrawRequest(testBankAccount.getId(), "500.00")))
                    .andExpect(status().isOk());

            // Verify wallet was debited (new request processed, not cached)
            BigDecimal balance = walletRepository.findByUserId(testCreator.getId())
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);

            assertThat(balance).isLessThan(new BigDecimal("10000.00"));
        }

        @Test
        @DisplayName("2xx response should be cached")
        void successResponse_cached() throws Exception {
            String idempotencyKey = "test-key-success";

            mockMvc.perform(post(WITHDRAW_ENDPOINT)
                    .header("Idempotency-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createWithdrawRequest(testBankAccount.getId(), "500.00")))
                    .andExpect(status().isOk());

            // Verify response was cached
            Optional<IdempotencyKey> cached = idempotencyKeyRepository.findByKey(idempotencyKey);
            assertThat(cached).isPresent();
            assertThat(cached.get().getResponseStatusCode()).isEqualTo(200);
            assertThat(cached.get().getResponseBody()).isNotNull();
            assertThat(cached.get().getContentType()).contains("application/json");
            assertThat(cached.get().getExpiresAt()).isAfter(LocalDateTime.now());
        }

        @Test
        @DisplayName("Non-2xx response should not be cached")
        void errorResponse_notCached() throws Exception {
            String idempotencyKey = "test-key-error";

            // Create invalid request (amount below minimum)
            mockMvc.perform(post(WITHDRAW_ENDPOINT)
                    .header("Idempotency-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createWithdrawRequest(testBankAccount.getId(), "10.00"))) // Below minimum
                    .andExpect(status().isBadRequest());

            // Verify response was not cached
            assertThat(idempotencyKeyRepository.findByKey(idempotencyKey)).isEmpty();
        }
    }

    @Nested
    @DisplayName("Bank Account Endpoint Tests")
    class BankAccountEndpointTests {

        @Test
        @DisplayName("Bank account creation should support idempotency")
        void bankAccountCreation_supportsIdempotency() throws Exception {
            String idempotencyKey = "test-key-bank-001";

            String bankAccountRequest = """
                    {
                        "accountHolderName": "New Account Holder",
                        "accountNumber": "9876543210123",
                        "ifscCode": "SBIN0001234",
                        "bankName": "State Bank of India",
                        "branchName": "Mumbai Main"
                    }
                    """;

            // First request
            mockMvc.perform(post(BANK_ACCOUNTS_ENDPOINT)
                    .header("Idempotency-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(bankAccountRequest))
                    .andExpect(status().isOk());

            // Count bank accounts after first request
            long countAfterFirst = bankAccountRepository.count();

            // Second request with same key
            mockMvc.perform(post(BANK_ACCOUNTS_ENDPOINT)
                    .header("Idempotency-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(bankAccountRequest))
                    .andExpect(status().isOk());

            // Verify no new bank account created
            long countAfterSecond = bankAccountRepository.count();
            assertThat(countAfterSecond).isEqualTo(countAfterFirst);
        }
    }

    @Nested
    @DisplayName("Content Type Preservation Tests")
    class ContentTypePreservationTests {

        @Test
        @DisplayName("Cached response should preserve Content-Type")
        void cachedResponse_preservesContentType() throws Exception {
            String idempotencyKey = "test-key-content-type";

            // First request
            mockMvc.perform(post(WITHDRAW_ENDPOINT)
                    .header("Idempotency-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createWithdrawRequest(testBankAccount.getId(), "500.00")))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));

            // Second request - should return cached with same content type
            mockMvc.perform(post(WITHDRAW_ENDPOINT)
                    .header("Idempotency-Key", idempotencyKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(createWithdrawRequest(testBankAccount.getId(), "500.00")))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
        }
    }

    // Helper methods

    private String createWithdrawRequest(String bankAccountId, String amount) {
        return String.format("""
                {
                    "bankAccountId": "%s",
                    "amount": %s
                }
                """, bankAccountId, amount);
    }

    private String createCampaignRequest() {
        return """
                {
                    "title": "Test Campaign",
                    "description": "A test campaign for idempotency testing",
                    "budget": 10000,
                    "category": "FASHION",
                    "targetPlatforms": ["INSTAGRAM"],
                    "deliverableTypes": ["POST"],
                    "startDate": "2025-02-01",
                    "endDate": "2025-03-01"
                }
                """;
    }
}
