package com.creatorx.api.integration;

import com.creatorx.common.enums.*;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.repository.*;
import com.creatorx.repository.entity.*;
import com.creatorx.service.WithdrawalService;
import com.creatorx.service.WalletService;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for payout integrity rules using PostgreSQL Testcontainers.
 * Validates withdrawal business rules including balance checks and concurrent
 * access.
 * 
 * <p>
 * Requires Docker to be running. Tests will be skipped if Docker is not
 * available.
 * </p>
 * 
 * <p>
 * Run with: ./gradlew :creatorx-api:test --tests
 * "*PayoutIntegrityIntegrationTest"
 * </p>
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
@ActiveProfiles("test-postgres")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Payout Integrity Integration Tests")
class PayoutIntegrityIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("creatorx_test")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    // Mock external services to prevent initialization failures
    @org.springframework.boot.test.mock.mockito.MockBean
    private com.creatorx.service.FCMService fcmService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.creatorx.service.CacheService cacheService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.cache.CacheManager cacheManager;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.creatorx.service.storage.SupabaseStorageService supabaseStorageService;

    @Autowired
    private WithdrawalService withdrawalService;

    @Autowired
    private WalletService walletService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private KYCDocumentRepository kycDocumentRepository;

    @Autowired
    private WithdrawalRequestRepository withdrawalRequestRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private User testCreator;
    private BankAccount verifiedBankAccount;

    @BeforeEach
    void setUp() {
        // Clean up from previous tests
        withdrawalRequestRepository.deleteAll();
        transactionRepository.deleteAll();
        bankAccountRepository.deleteAll();
        kycDocumentRepository.deleteAll();
        walletRepository.deleteAll();
        userRepository.deleteAll();

        // Create test creator with wallet
        testCreator = userRepository.save(
                TestDataBuilder.user()
                        .asCreator()
                        .withEmail("payout-test-creator@example.com")
                        .build());

        // Create wallet with initial balance
        Wallet wallet = Wallet.builder()
                .user(testCreator)
                .balance(new BigDecimal("5000.00"))
                .pendingBalance(BigDecimal.ZERO)
                .totalEarned(new BigDecimal("5000.00"))
                .totalWithdrawn(BigDecimal.ZERO)
                .currency(CurrencyType.INR)
                .build();
        walletRepository.save(wallet);

        // Create verified bank account
        verifiedBankAccount = bankAccountRepository.save(
                BankAccount.builder()
                        .user(testCreator)
                        .accountHolderName("Test Creator")
                        .accountNumber("1234567890")
                        .ifscCode("HDFC0001234")
                        .bankName("HDFC Bank")
                        .verified(true)
                        .isDefault(true)
                        .build());
    }

    // ============== TEST 1: KYC Validation ==============
    // Note: Current WithdrawalService does not validate KYC status.
    // This test documents the expected behavior that should be implemented.
    // Keeping as @Disabled until KYC validation is added to WithdrawalService.

    @Test
    @Order(1)
    @DisplayName("Withdrawal request should fail if user KYC is not APPROVED")
    @Disabled("KYC validation not yet implemented in WithdrawalService - requires service modification")
    void withdrawalShouldFailIfKYCNotApproved() {
        // Create KYC document with PENDING status
        kycDocumentRepository.save(
                KYCDocument.builder()
                        .user(testCreator)
                        .documentType(DocumentType.AADHAAR)
                        .documentNumber("123456789012")
                        .documentUrl("https://example.com/aadhaar.jpg")
                        .status(DocumentStatus.PENDING)
                        .build());

        // Attempt withdrawal - should fail due to KYC not approved
        assertThatThrownBy(() -> withdrawalService.requestWithdrawal(
                testCreator.getId(),
                new BigDecimal("1000.00"),
                verifiedBankAccount.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("KYC");
    }

    // ============== TEST 2: No Default Bank Account ==============

    @Test
    @Order(2)
    @DisplayName("Withdrawal request should fail if no default bank account exists")
    void withdrawalShouldFailIfNoBankAccount() {
        // Delete the verified bank account
        bankAccountRepository.deleteAll();

        // Attempt withdrawal with non-existent bank account ID
        assertThatThrownBy(() -> withdrawalService.requestWithdrawal(
                testCreator.getId(),
                new BigDecimal("1000.00"),
                "non-existent-bank-account-id"))
                .isInstanceOf(Exception.class) // ResourceNotFoundException
                .hasMessageContaining("Bank account");
    }

    // ============== TEST 3: Insufficient Balance ==============

    @Test
    @Order(3)
    @DisplayName("Withdrawal request amount cannot exceed available balance")
    void withdrawalShouldFailIfAmountExceedsBalance() {
        // Available balance is 5000.00
        BigDecimal excessAmount = new BigDecimal("10000.00");

        assertThatThrownBy(() -> withdrawalService.requestWithdrawal(
                testCreator.getId(),
                excessAmount,
                verifiedBankAccount.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Insufficient balance");
    }

    // ============== TEST 4: Concurrent Withdrawal Overdraft Protection
    // ==============

    @Test
    @Order(4)
    @DisplayName("Two concurrent withdrawal requests should not overdraft")
    void concurrentWithdrawalsShouldNotOverdraft() throws Exception {
        // Set balance to exactly 3000
        Wallet wallet = walletRepository.findById(testCreator.getId()).orElseThrow();
        wallet.setBalance(new BigDecimal("3000.00"));
        walletRepository.save(wallet);

        // Try to withdraw 2000 twice concurrently (total 4000 > 3000 balance)
        int threadCount = 2;
        BigDecimal withdrawalAmount = new BigDecimal("2000.00");
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                try {
                    latch.await(); // Wait for all threads to be ready
                    withdrawalService.requestWithdrawal(
                            testCreator.getId(),
                            withdrawalAmount,
                            verifiedBankAccount.getId());
                    successCount.incrementAndGet();
                } catch (BusinessException e) {
                    if (e.getMessage().contains("Insufficient balance")) {
                        failureCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    // Other exceptions
                }
            }));
        }

        // Release all threads at once
        latch.countDown();

        // Wait for completion
        for (Future<?> future : futures) {
            try {
                future.get(10, TimeUnit.SECONDS);
            } catch (ExecutionException ignored) {
            }
        }
        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);

        // Verify: Only one should succeed, one should fail
        // OR in rare race condition, both fail is also acceptable
        assertThat(successCount.get()).isLessThanOrEqualTo(1);

        // Verify final balance is not negative
        Wallet finalWallet = walletRepository.findById(testCreator.getId()).orElseThrow();
        assertThat(finalWallet.getBalance()).isGreaterThanOrEqualTo(BigDecimal.ZERO);

        // Verify total withdrawals don't exceed original balance
        long withdrawalCount = withdrawalRequestRepository.count();
        BigDecimal totalWithdrawn = withdrawalCount == 0 ? BigDecimal.ZERO
                : withdrawalAmount.multiply(BigDecimal.valueOf(withdrawalCount));
        assertThat(totalWithdrawn).isLessThanOrEqualTo(new BigDecimal("3000.00"));
    }

    // ============== TEST 5: Successful Withdrawal Creates Records ==============

    @Test
    @Order(5)
    @DisplayName("Successful withdrawal creates a Withdrawal record and transaction entry")
    void successfulWithdrawalCreatesRecords() {
        BigDecimal withdrawalAmount = new BigDecimal("1000.00");
        BigDecimal initialBalance = walletService.getAvailableBalance(testCreator.getId());

        // Request withdrawal
        var withdrawalDTO = withdrawalService.requestWithdrawal(
                testCreator.getId(),
                withdrawalAmount,
                verifiedBankAccount.getId());

        // Verify WithdrawalRequest was created
        assertThat(withdrawalDTO).isNotNull();
        assertThat(withdrawalDTO.getId()).isNotNull();
        assertThat(withdrawalDTO.getAmount()).isEqualByComparingTo(withdrawalAmount);
        assertThat(withdrawalDTO.getStatus()).isEqualTo(WithdrawalStatus.PENDING);

        // Verify Transaction record was created
        var transactions = transactionRepository.findByUserId(testCreator.getId(),
                org.springframework.data.domain.Pageable.unpaged());
        assertThat(transactions.getContent()).isNotEmpty();

        var withdrawalTransaction = transactions.getContent().stream()
                .filter(t -> t.getType() == TransactionType.WITHDRAWAL)
                .findFirst()
                .orElseThrow();

        assertThat(withdrawalTransaction.getAmount()).isEqualByComparingTo(withdrawalAmount);
        assertThat(withdrawalTransaction.getStatus()).isEqualTo(TransactionStatus.PENDING);

        // Verify balance was debited
        BigDecimal newBalance = walletService.getAvailableBalance(testCreator.getId());
        assertThat(newBalance).isEqualByComparingTo(initialBalance.subtract(withdrawalAmount));
    }

    // ============== TEST 6: Unverified Bank Account ==============

    @Test
    @Order(6)
    @DisplayName("Withdrawal should fail with unverified bank account")
    void withdrawalShouldFailWithUnverifiedBankAccount() {
        // Create unverified bank account
        BankAccount unverifiedAccount = bankAccountRepository.save(
                BankAccount.builder()
                        .user(testCreator)
                        .accountHolderName("Test Creator")
                        .accountNumber("9876543210")
                        .ifscCode("ICIC0001234")
                        .bankName("ICICI Bank")
                        .verified(false)
                        .isDefault(false)
                        .build());

        assertThatThrownBy(() -> withdrawalService.requestWithdrawal(
                testCreator.getId(),
                new BigDecimal("500.00"),
                unverifiedAccount.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("verified");
    }

    // ============== TEST 7: Minimum Withdrawal Amount ==============

    @Test
    @Order(7)
    @DisplayName("Withdrawal should fail if amount is below minimum")
    void withdrawalShouldFailIfBelowMinimum() {
        // Minimum is 100.00 as per WithdrawalService
        BigDecimal belowMinimum = new BigDecimal("50.00");

        assertThatThrownBy(() -> withdrawalService.requestWithdrawal(
                testCreator.getId(),
                belowMinimum,
                verifiedBankAccount.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Minimum withdrawal amount");
    }
}
