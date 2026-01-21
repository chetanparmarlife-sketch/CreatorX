package com.creatorx.service;

import com.creatorx.repository.BankAccountRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BankAccount;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.BankAccountDTO;
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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("BankAccountService Unit Tests")
class BankAccountServiceTest {

    @Mock
    private BankAccountRepository bankAccountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BankAccountMapper bankAccountMapper;

    @Mock
    private RazorpayService razorpayService;

    private BankAccountService bankAccountService;

    private User creator;

    @BeforeEach
    void setUp() {
        creator = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@example.com")
                .build();

        bankAccountService = new BankAccountService(
                bankAccountRepository,
                userRepository,
                bankAccountMapper,
                Optional.of(razorpayService)
        );

        lenient().when(userRepository.findById(creator.getId()))
                .thenReturn(Optional.of(creator));
        lenient().when(bankAccountRepository.findByUserId(creator.getId()))
                .thenReturn(List.of());
        lenient().when(bankAccountRepository.save(any(BankAccount.class)))
                .thenAnswer(invocation -> {
                    BankAccount account = invocation.getArgument(0);
                    if (account.getId() == null) {
                        account.setId("bank-123");
                    }
                    return account;
                });
        lenient().when(bankAccountMapper.toDTO(any(BankAccount.class)))
                .thenAnswer(invocation -> {
                    BankAccount account = invocation.getArgument(0);
                    return BankAccountDTO.builder()
                            .id(account.getId())
                            .accountHolderName(account.getAccountHolderName())
                            .accountNumber(account.getAccountNumber())
                            .ifscCode(account.getIfscCode())
                            .bankName(account.getBankName())
                            .branchName(account.getBranchName())
                            .upiId(account.getUpiId())
                            .verified(account.getVerified())
                            .isDefault(account.getIsDefault())
                            .build();
                });
    }

    @Test
    @DisplayName("Should verify bank account on creation when Razorpay confirms")
    void shouldVerifyBankAccountOnCreateWhenRazorpayConfirms() {
        when(razorpayService.verifyBankAccount(any(BankAccount.class))).thenReturn(true);

        BankAccountDTO result = bankAccountService.addBankAccount(
                creator.getId(),
                "Test Creator",
                "1234567890",
                "HDFC0001234",
                "HDFC Bank",
                "Main Branch",
                null
        );

        assertThat(result.getVerified()).isTrue();
        verify(razorpayService).verifyBankAccount(any(BankAccount.class));
        verify(bankAccountRepository, times(2)).save(any(BankAccount.class));
    }

    @Test
    @DisplayName("Should keep bank account unverified when Razorpay verification fails on create")
    void shouldKeepBankAccountUnverifiedWhenVerificationFailsOnCreate() {
        when(razorpayService.verifyBankAccount(any(BankAccount.class)))
                .thenThrow(new RuntimeException("verification failed"));

        BankAccountDTO result = bankAccountService.addBankAccount(
                creator.getId(),
                "Test Creator",
                "1234567890",
                "HDFC0001234",
                "HDFC Bank",
                "Main Branch",
                null
        );

        assertThat(result.getVerified()).isFalse();
        verify(razorpayService).verifyBankAccount(any(BankAccount.class));
        verify(bankAccountRepository, times(1)).save(any(BankAccount.class));
    }

    @Test
    @DisplayName("Should not throw and keep bank account unverified when verification fails on update")
    void shouldNotThrowAndKeepUnverifiedWhenVerificationFailsOnUpdate() {
        BankAccount existing = BankAccount.builder()
                .id("bank-456")
                .user(creator)
                .accountHolderName("Test Creator")
                .accountNumber("1234567890")
                .ifscCode("HDFC0001234")
                .bankName("HDFC Bank")
                .verified(true)
                .isDefault(true)
                .build();

        when(bankAccountRepository.findById(existing.getId()))
                .thenReturn(Optional.of(existing));
        when(razorpayService.verifyBankAccount(existing))
                .thenThrow(new RuntimeException("verification failed"));

        assertThatNoException().isThrownBy(() -> bankAccountService.verifyBankAccount(existing.getId()));

        assertThat(existing.getVerified()).isFalse();
        verify(bankAccountRepository, times(1)).save(existing);
    }
}
