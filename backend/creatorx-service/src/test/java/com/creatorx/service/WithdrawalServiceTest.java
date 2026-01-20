package com.creatorx.service;

import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.common.enums.WithdrawalStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.repository.BankAccountRepository;
import com.creatorx.repository.TransactionRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.WithdrawalRequestRepository;
import com.creatorx.repository.entity.BankAccount;
import com.creatorx.repository.entity.Transaction;
import com.creatorx.repository.entity.User;
import com.creatorx.repository.entity.WithdrawalRequest;
import com.creatorx.service.admin.AdminAuditService;
import com.creatorx.service.mapper.BankAccountMapper;
import com.creatorx.service.razorpay.RazorpayService;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("WithdrawalService Unit Tests")
class WithdrawalServiceTest {

    @Mock
    private WithdrawalRequestRepository withdrawalRequestRepository;

    @Mock
    private BankAccountRepository bankAccountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private WalletService walletService;

    @Mock
    private BankAccountMapper bankAccountMapper;

    @Mock
    private AdminAuditService adminAuditService;

    @Mock
    private PlatformSettingsResolver platformSettingsResolver;

    @Mock
    private KYCService kycService;

    @Mock
    private RazorpayService razorpayService;

    private WithdrawalService withdrawalService;

    private User creator;
    private User admin;
    private BankAccount bankAccount;
    private WithdrawalRequest withdrawalRequest;
    private Transaction withdrawalTransaction;

    @BeforeEach
    void setUp() {
        creator = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@example.com")
                .build();

        admin = TestDataBuilder.user()
                .asAdmin()
                .withEmail("admin@example.com")
                .build();

        bankAccount = BankAccount.builder()
                .id("bank-123")
                .user(creator)
                .accountHolderName("Test Creator")
                .accountNumber("1234567890")
                .ifscCode("HDFC0001234")
                .bankName("HDFC Bank")
                .verified(true)
                .isDefault(true)
                .build();

        withdrawalRequest = WithdrawalRequest.builder()
                .id("withdraw-123")
                .user(creator)
                .amount(new BigDecimal("500.00"))
                .bankAccount(bankAccount)
                .status(WithdrawalStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();

        withdrawalTransaction = Transaction.builder()
                .id("txn-123")
                .user(creator)
                .type(TransactionType.WITHDRAWAL)
                .amount(withdrawalRequest.getAmount())
                .status(TransactionStatus.PENDING)
                .metadata(new HashMap<>())
                .build();
        withdrawalTransaction.getMetadata().put("withdrawalRequestId", withdrawalRequest.getId());

        withdrawalService = new WithdrawalService(
                withdrawalRequestRepository,
                bankAccountRepository,
                userRepository,
                transactionRepository,
                walletService,
                bankAccountMapper,
                adminAuditService,
                platformSettingsResolver,
                kycService,
                Optional.of(razorpayService)
        );

        lenient().when(kycService.isKYCVerified(creator.getId())).thenReturn(true);
        lenient().when(withdrawalRequestRepository.findById(withdrawalRequest.getId()))
                .thenReturn(Optional.of(withdrawalRequest));
        lenient().when(userRepository.findById(admin.getId()))
                .thenReturn(Optional.of(admin));
        lenient().when(bankAccountRepository.findByIdAndUserId(bankAccount.getId(), creator.getId()))
                .thenReturn(Optional.of(bankAccount));
        lenient().when(withdrawalRequestRepository.save(any(WithdrawalRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(transactionRepository.findByUserId(eq(creator.getId()), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(withdrawalTransaction)));
        lenient().when(transactionRepository.save(any(Transaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("Should set PROCESSING and payout id when approving withdrawal")
    void shouldApproveWithdrawalAndCreatePayout() {
        when(razorpayService.createPayout(withdrawalRequest.getId(), withdrawalRequest.getAmount(), bankAccount))
                .thenReturn("pout_123");

        withdrawalService.approveWithdrawal(admin.getId(), withdrawalRequest.getId());

        assertThat(withdrawalRequest.getStatus()).isEqualTo(WithdrawalStatus.PROCESSING);
        assertThat(withdrawalRequest.getRazorpayPayoutId()).isEqualTo("pout_123");
        assertThat(withdrawalRequest.getProcessedBy()).isEqualTo(admin);
        assertThat(withdrawalRequest.getProcessedAt()).isNotNull();
        assertThat(withdrawalTransaction.getStatus()).isEqualTo(TransactionStatus.COMPLETED);

        verify(razorpayService).createPayout(withdrawalRequest.getId(), withdrawalRequest.getAmount(), bankAccount);
        verify(walletService, never()).creditWalletWithType(anyString(), any(), anyString(), any(), any(), anyMap());
    }

    @Test
    @DisplayName("Should mark FAILED and refund once when payout creation fails")
    void shouldFailAndRefundOnceWhenPayoutCreationFails() {
        when(razorpayService.createPayout(withdrawalRequest.getId(), withdrawalRequest.getAmount(), bankAccount))
                .thenThrow(new RuntimeException("boom"));

        assertThatThrownBy(() -> withdrawalService.approveWithdrawal(admin.getId(), withdrawalRequest.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Failed to process payout");

        assertThat(withdrawalRequest.getStatus()).isEqualTo(WithdrawalStatus.FAILED);
        assertThat(withdrawalRequest.getFailureReason()).contains("boom");
        assertThat(withdrawalRequest.getRefundedAt()).isNotNull();
        assertThat(withdrawalTransaction.getStatus()).isEqualTo(TransactionStatus.FAILED);

        verify(walletService, times(1)).creditWalletWithType(
                eq(creator.getId()),
                eq(withdrawalRequest.getAmount()),
                contains("Payout failed"),
                isNull(),
                eq(TransactionType.REFUND),
                anyMap()
        );
    }
}
