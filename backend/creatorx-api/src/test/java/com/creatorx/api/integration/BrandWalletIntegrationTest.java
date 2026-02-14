package com.creatorx.api.integration;

import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.repository.BrandWalletRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.EscrowTransactionRepository;
import com.creatorx.repository.entity.BrandWallet;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Brand Wallet Integration Tests")
class BrandWalletIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private BrandWalletRepository brandWalletRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private EscrowTransactionRepository escrowTransactionRepository;

    private BrandWallet wallet;
    private Campaign campaign;

    @BeforeEach
    @Override
    public void setUpBaseTest() {
        super.setUpBaseTest();

        // Create wallet with funds
        wallet = BrandWallet.builder()
                .brandId(testBrand.getId())
                .balance(new BigDecimal("50000.00"))
                .totalDeposited(new BigDecimal("50000.00"))
                .totalAllocated(BigDecimal.ZERO)
                .totalReleased(BigDecimal.ZERO)
                .build();
        wallet = brandWalletRepository.save(wallet);

        // Create active campaign
        campaign = TestDataBuilder.campaign()
                .withBrand(testBrand)
                .active()
                .withBudget(new BigDecimal("10000.00"))
                .build();
        campaign.setEscrowAllocated(BigDecimal.ZERO);
        campaign.setEscrowReleased(BigDecimal.ZERO);
        campaign.setEscrowStatus("UNFUNDED");
        campaign = campaignRepository.save(campaign);
    }

    @Nested
    @DisplayName("GET /api/v1/brand-wallet")
    class GetWalletTests {

        @Test
        @DisplayName("Should return wallet balance for authenticated brand")
        void shouldReturnWallet() throws Exception {
            authenticateAsBrand();

            mockMvc.perform(get("/api/v1/brand-wallet"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.balance").value(50000.00))
                    .andExpect(jsonPath("$.totalDeposited").value(50000.00))
                    .andExpect(jsonPath("$.currency").value("INR"));
        }

        @Test
        @DisplayName("Should reject unauthenticated request")
        void shouldRejectUnauthenticated() throws Exception {
            clearAuthentication();

            mockMvc.perform(get("/api/v1/brand-wallet"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should reject creator role")
        void shouldRejectCreatorRole() throws Exception {
            authenticateAsCreator();

            mockMvc.perform(get("/api/v1/brand-wallet"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/brand-wallet/campaigns/{id}/allocate")
    class AllocateTests {

        @Test
        @DisplayName("Should allocate funds to campaign")
        void shouldAllocateFunds() throws Exception {
            authenticateAsBrand();

            mockMvc.perform(post("/api/v1/brand-wallet/campaigns/" + campaign.getId() + "/allocate")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"amount\": 5000}"))
                    .andExpect(status().isOk());

            // Verify wallet balance decreased
            BrandWallet updated = brandWalletRepository.findByBrandId(testBrand.getId()).orElseThrow();
            assertThat(updated.getBalance()).isEqualByComparingTo(new BigDecimal("45000.00"));

            // Verify campaign escrow increased
            Campaign updatedCampaign = campaignRepository.findById(campaign.getId()).orElseThrow();
            assertThat(updatedCampaign.getEscrowAllocated()).isEqualByComparingTo(new BigDecimal("5000.00"));
        }

        @Test
        @DisplayName("Should reject allocation exceeding balance")
        void shouldRejectExceedingBalance() throws Exception {
            authenticateAsBrand();

            mockMvc.perform(post("/api/v1/brand-wallet/campaigns/" + campaign.getId() + "/allocate")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"amount\": 999999}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Full escrow lifecycle")
    class LifecycleTests {

        @Test
        @DisplayName("Should complete allocate → refund cycle")
        void shouldCompleteAllocateRefundCycle() throws Exception {
            authenticateAsBrand();

            // Step 1: Allocate funds
            mockMvc.perform(post("/api/v1/brand-wallet/campaigns/" + campaign.getId() + "/allocate")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"amount\": 10000}"))
                    .andExpect(status().isOk());

            BrandWallet afterAllocate = brandWalletRepository.findByBrandId(testBrand.getId()).orElseThrow();
            assertThat(afterAllocate.getBalance()).isEqualByComparingTo(new BigDecimal("40000.00"));

            Campaign afterAllocateCampaign = campaignRepository.findById(campaign.getId()).orElseThrow();
            assertThat(afterAllocateCampaign.getEscrowStatus()).isEqualTo("FUNDED");
            assertThat(afterAllocateCampaign.getEscrowAllocated()).isEqualByComparingTo(new BigDecimal("10000.00"));

            // Step 2: Verify escrow transactions were recorded
            long txCount = escrowTransactionRepository.findByBrandIdOrderByCreatedAtDesc(
                    testBrand.getId(), org.springframework.data.domain.PageRequest.of(0, 100)).getTotalElements();
            assertThat(txCount).isGreaterThan(0);
        }
    }

    @Nested
    @DisplayName("GET /api/v1/brand-wallet/transactions")
    class TransactionTests {

        @Test
        @DisplayName("Should return empty transactions for new wallet")
        void shouldReturnEmptyTransactions() throws Exception {
            authenticateAsBrand();

            mockMvc.perform(get("/api/v1/brand-wallet/transactions")
                            .param("page", "0")
                            .param("size", "20"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());
        }
    }
}
