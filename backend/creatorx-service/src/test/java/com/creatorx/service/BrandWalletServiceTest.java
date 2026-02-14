package com.creatorx.service;

import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.EscrowTransactionType;
import com.creatorx.common.enums.PaymentOrderStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.BrandWalletRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.EscrowTransactionRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BrandWallet;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.PaymentOrder;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.BrandWalletDTO;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("BrandWalletService Unit Tests")
class BrandWalletServiceTest {

    @Mock
    private BrandWalletRepository brandWalletRepository;

    @Mock
    private EscrowTransactionRepository escrowTransactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private PaymentCollectionService paymentCollectionService;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private BrandWalletService brandWalletService;

    private User brandUser;
    private BrandWallet wallet;
    private Campaign campaign;

    @BeforeEach
    void setUp() {
        brandUser = TestDataBuilder.user()
                .asBrand()
                .withEmail("brand@example.com")
                .build();

        wallet = BrandWallet.builder()
                .brandId(brandUser.getId())
                .balance(new BigDecimal("50000.00"))
                .totalDeposited(new BigDecimal("100000.00"))
                .totalAllocated(new BigDecimal("50000.00"))
                .totalReleased(new BigDecimal("20000.00"))
                .currency("INR")
                .build();

        campaign = TestDataBuilder.campaign()
                .withBrand(brandUser)
                .active()
                .withBudget(new BigDecimal("10000.00"))
                .build();
        campaign.setEscrowAllocated(BigDecimal.ZERO);
        campaign.setEscrowReleased(BigDecimal.ZERO);
        campaign.setEscrowStatus("UNFUNDED");

        when(escrowTransactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Nested
    @DisplayName("getWallet")
    class GetWalletTests {

        @Test
        @DisplayName("Should return wallet DTO with correct balances")
        void shouldReturnWalletDTO() {
            when(brandWalletRepository.findByBrandId(brandUser.getId()))
                    .thenReturn(Optional.of(wallet));

            BrandWalletDTO dto = brandWalletService.getWallet(brandUser.getId());

            assertThat(dto.getBalance()).isEqualByComparingTo(new BigDecimal("50000.00"));
            assertThat(dto.getTotalDeposited()).isEqualByComparingTo(new BigDecimal("100000.00"));
            assertThat(dto.getTotalAllocated()).isEqualByComparingTo(new BigDecimal("50000.00"));
            assertThat(dto.getTotalReleased()).isEqualByComparingTo(new BigDecimal("20000.00"));
        }

        @Test
        @DisplayName("Should create wallet if not exists")
        void shouldCreateWalletIfNotExists() {
            when(brandWalletRepository.findByBrandId(brandUser.getId()))
                    .thenReturn(Optional.empty());
            when(userRepository.findById(brandUser.getId()))
                    .thenReturn(Optional.of(brandUser));
            when(brandWalletRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            BrandWalletDTO dto = brandWalletService.getWallet(brandUser.getId());

            assertThat(dto.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);
            verify(brandWalletRepository).save(any(BrandWallet.class));
        }
    }

    @Nested
    @DisplayName("createDepositOrder")
    class DepositTests {

        @Test
        @DisplayName("Should reject zero amount")
        void shouldRejectZeroAmount() {
            assertThatThrownBy(() ->
                    brandWalletService.createDepositOrder(brandUser.getId(), BigDecimal.ZERO))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("Should reject amount below minimum")
        void shouldRejectBelowMinimum() {
            assertThatThrownBy(() ->
                    brandWalletService.createDepositOrder(brandUser.getId(), new BigDecimal("500")))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Minimum");
        }
    }

    @Nested
    @DisplayName("creditWalletFromPayment")
    class CreditFromPaymentTests {

        @Test
        @DisplayName("Should credit wallet on captured payment")
        void shouldCreditWallet() {
            PaymentOrder paymentOrder = PaymentOrder.builder()
                    .id("po-1")
                    .brand(brandUser)
                    .amount(new BigDecimal("10000.00"))
                    .status(PaymentOrderStatus.CAPTURED)
                    .razorpayPaymentId("pay_test123")
                    .razorpayOrderId("order_test123")
                    .build();

            when(brandWalletRepository.findByBrandIdWithLock(brandUser.getId()))
                    .thenReturn(Optional.of(wallet));
            when(brandWalletRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            brandWalletService.creditWalletFromPayment(paymentOrder);

            assertThat(wallet.getBalance()).isEqualByComparingTo(new BigDecimal("60000.00"));
            assertThat(wallet.getTotalDeposited()).isEqualByComparingTo(new BigDecimal("110000.00"));
            verify(escrowTransactionRepository).save(any());
        }

        @Test
        @DisplayName("Should reject non-captured payment")
        void shouldRejectNonCaptured() {
            PaymentOrder paymentOrder = PaymentOrder.builder()
                    .id("po-1")
                    .brand(brandUser)
                    .amount(new BigDecimal("10000.00"))
                    .status(PaymentOrderStatus.CREATED)
                    .build();

            assertThatThrownBy(() -> brandWalletService.creditWalletFromPayment(paymentOrder))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("Should skip payment with campaign (not a wallet deposit)")
        void shouldSkipCampaignPayment() {
            PaymentOrder paymentOrder = PaymentOrder.builder()
                    .id("po-1")
                    .brand(brandUser)
                    .campaign(campaign)
                    .amount(new BigDecimal("10000.00"))
                    .status(PaymentOrderStatus.CAPTURED)
                    .build();

            brandWalletService.creditWalletFromPayment(paymentOrder);

            verify(brandWalletRepository, never()).findByBrandIdWithLock(anyString());
        }
    }

    @Nested
    @DisplayName("allocateToCampaign")
    class AllocationTests {

        @Test
        @DisplayName("Should allocate funds to campaign")
        void shouldAllocateFunds() {
            BigDecimal amount = new BigDecimal("5000.00");

            when(brandWalletRepository.findByBrandIdWithLock(brandUser.getId()))
                    .thenReturn(Optional.of(wallet));
            when(campaignRepository.findById(campaign.getId()))
                    .thenReturn(Optional.of(campaign));
            when(brandWalletRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(campaignRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            brandWalletService.allocateToCampaign(brandUser.getId(), campaign.getId(), amount);

            assertThat(wallet.getBalance()).isEqualByComparingTo(new BigDecimal("45000.00"));
            assertThat(campaign.getEscrowAllocated()).isEqualByComparingTo(new BigDecimal("5000.00"));
        }

        @Test
        @DisplayName("Should reject allocation with insufficient balance")
        void shouldRejectInsufficientBalance() {
            BigDecimal amount = new BigDecimal("999999.00");

            when(brandWalletRepository.findByBrandIdWithLock(brandUser.getId()))
                    .thenReturn(Optional.of(wallet));

            assertThatThrownBy(() ->
                    brandWalletService.allocateToCampaign(brandUser.getId(), campaign.getId(), amount))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Insufficient");
        }

        @Test
        @DisplayName("Should reject zero allocation amount")
        void shouldRejectZeroAmount() {
            assertThatThrownBy(() ->
                    brandWalletService.allocateToCampaign(brandUser.getId(), campaign.getId(), BigDecimal.ZERO))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("Should set escrow status to FUNDED when fully funded")
        void shouldSetStatusFunded() {
            BigDecimal amount = new BigDecimal("10000.00");

            when(brandWalletRepository.findByBrandIdWithLock(brandUser.getId()))
                    .thenReturn(Optional.of(wallet));
            when(campaignRepository.findById(campaign.getId()))
                    .thenReturn(Optional.of(campaign));
            when(brandWalletRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(campaignRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            brandWalletService.allocateToCampaign(brandUser.getId(), campaign.getId(), amount);

            assertThat(campaign.getEscrowStatus()).isEqualTo("FUNDED");
        }

        @Test
        @DisplayName("Should set escrow status to PARTIAL when partially funded")
        void shouldSetStatusPartial() {
            BigDecimal amount = new BigDecimal("3000.00");

            when(brandWalletRepository.findByBrandIdWithLock(brandUser.getId()))
                    .thenReturn(Optional.of(wallet));
            when(campaignRepository.findById(campaign.getId()))
                    .thenReturn(Optional.of(campaign));
            when(brandWalletRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(campaignRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            brandWalletService.allocateToCampaign(brandUser.getId(), campaign.getId(), amount);

            assertThat(campaign.getEscrowStatus()).isEqualTo("PARTIAL");
        }
    }

    @Nested
    @DisplayName("refundUnusedCampaignFunds")
    class RefundTests {

        @Test
        @DisplayName("Should refund unused funds to wallet")
        void shouldRefundUnusedFunds() {
            campaign.setEscrowAllocated(new BigDecimal("10000.00"));
            campaign.setEscrowReleased(new BigDecimal("3000.00"));

            when(campaignRepository.findById(campaign.getId()))
                    .thenReturn(Optional.of(campaign));
            when(brandWalletRepository.findByBrandIdWithLock(brandUser.getId()))
                    .thenReturn(Optional.of(wallet));
            when(brandWalletRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(campaignRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            brandWalletService.refundUnusedCampaignFunds(campaign.getId());

            // 10000 - 3000 = 7000 refunded
            assertThat(wallet.getBalance()).isEqualByComparingTo(new BigDecimal("57000.00"));
            assertThat(campaign.getEscrowStatus()).isEqualTo("REFUNDED");
            assertThat(campaign.getEscrowAllocated()).isEqualByComparingTo(campaign.getEscrowReleased());
        }

        @Test
        @DisplayName("Should skip refund when no unused funds")
        void shouldSkipWhenNoUnusedFunds() {
            campaign.setEscrowAllocated(new BigDecimal("5000.00"));
            campaign.setEscrowReleased(new BigDecimal("5000.00"));

            when(campaignRepository.findById(campaign.getId()))
                    .thenReturn(Optional.of(campaign));

            brandWalletService.refundUnusedCampaignFunds(campaign.getId());

            verify(brandWalletRepository, never()).findByBrandIdWithLock(anyString());
        }

        @Test
        @DisplayName("Should throw when campaign not found")
        void shouldThrowWhenCampaignNotFound() {
            when(campaignRepository.findById("nonexistent"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> brandWalletService.refundUnusedCampaignFunds("nonexistent"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
