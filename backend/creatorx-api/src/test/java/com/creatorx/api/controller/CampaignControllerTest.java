package com.creatorx.api.controller;

import com.creatorx.api.dto.CampaignCreateRequest;
import com.creatorx.api.integration.BaseIntegrationTest;
import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.service.CampaignService;
import com.creatorx.service.dto.CampaignDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("CampaignController API Tests")
class CampaignControllerTest extends BaseIntegrationTest {

        @Autowired
        private CampaignService campaignService;

        @Autowired
        private CampaignRepository campaignRepository;

        @Autowired
        private ObjectMapper objectMapper;

        private CampaignCreateRequest createRequest;

        @BeforeEach
        @Override
        public void setUpBaseTest() {
                super.setUpBaseTest();

                // Set up test data
                createRequest = new CampaignCreateRequest();
                createRequest.setTitle("Test Campaign");
                createRequest.setDescription(
                                "Test campaign description that meets minimum length requirements for validation");
                createRequest.setBudget(BigDecimal.valueOf(5000));
                createRequest.setPlatform(CampaignPlatform.INSTAGRAM);
                createRequest.setCategory("Fashion");
                createRequest.setRequirements("Test requirements");
                createRequest.setStartDate(LocalDate.now().plusDays(7));
                createRequest.setEndDate(LocalDate.now().plusDays(37));
                createRequest.setApplicationDeadline(LocalDate.now().plusDays(5));
                createRequest.setMaxApplicants(50);
                createRequest.setDeliverableTypes(java.util.List.of("INSTAGRAM_POST", "INSTAGRAM_STORY"));
        }

        @Test
        @DisplayName("GET /api/v1/campaigns should return paginated campaigns")
        void testGetCampaigns_Success() throws Exception {
                authenticateAsBrand();

                mockMvc.perform(get("/api/v1/campaigns")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.items").isArray());
        }

        @Test
        @DisplayName("GET /api/v1/campaigns/{id} should return campaign details")
        void testGetCampaignById_Success() throws Exception {
                authenticateAsBrand();

                // Create a campaign first
                CampaignDTO campaign = createTestCampaign();

                mockMvc.perform(get("/api/v1/campaigns/" + campaign.getId())
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(campaign.getId()))
                                .andExpect(jsonPath("$.title").value(campaign.getTitle()));
        }

        @Test
        @DisplayName("POST /api/v1/campaigns should create campaign (Brand only)")
        void testCreateCampaign_Success() throws Exception {
                authenticateAsBrand();

                mockMvc.perform(post("/api/v1/campaigns")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.title").value("Test Campaign"))
                                .andExpect(jsonPath("$.brand.id").value(testBrand.getId()));
        }

        @Test
        @DisplayName("POST /api/v1/campaigns should return 403 for non-brand users")
        void testCreateCampaign_Forbidden() throws Exception {
                authenticateAsCreator();

                mockMvc.perform(post("/api/v1/campaigns")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("POST /api/v1/campaigns should return 400 for invalid request")
        void testCreateCampaign_ValidationError() throws Exception {
                authenticateAsBrand();

                // Create invalid request (missing required field)
                CampaignCreateRequest invalidRequest = new CampaignCreateRequest();
                invalidRequest.setTitle(""); // Invalid: empty title

                mockMvc.perform(post("/api/v1/campaigns")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRequest)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("PUT /api/v1/campaigns/{id} should update campaign")
        void testUpdateCampaign_Success() throws Exception {
                authenticateAsBrand();

                CampaignDTO campaign = createTestCampaign();

                createRequest.setTitle("Updated Campaign Title");

                mockMvc.perform(put("/api/v1/campaigns/" + campaign.getId())
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.title").value("Updated Campaign Title"));
        }

        @Test
        @DisplayName("DELETE /api/v1/campaigns/{id} should delete campaign")
        void testDeleteCampaign_Success() throws Exception {
                authenticateAsBrand();

                CampaignDTO campaign = createTestCampaign();

                mockMvc.perform(delete("/api/v1/campaigns/" + campaign.getId())
                                .with(csrf()))
                                .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("POST /api/v1/campaigns/{id}/save should save campaign (Creator only)")
        void testSaveCampaign_Success() throws Exception {
                authenticateAsBrand();
                // Save campaign requires ACTIVE status
                CampaignDTO campaign = createActiveCampaign();

                authenticateAsCreator();

                mockMvc.perform(post("/api/v1/campaigns/" + campaign.getId() + "/save")
                                .with(csrf()))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("GET /api/v1/campaigns/saved should return saved campaigns")
        void testGetSavedCampaigns_Success() throws Exception {
                authenticateAsCreator();

                mockMvc.perform(get("/api/v1/campaigns/saved")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray());
        }

        // Helper methods

        private CampaignDTO createTestCampaign() {
                CampaignDTO campaignDTO = new CampaignDTO();
                campaignDTO.setTitle("Test Campaign");
                campaignDTO.setDescription("Test campaign description that meets minimum length requirements");
                campaignDTO.setBudget(BigDecimal.valueOf(5000));
                campaignDTO.setPlatform(CampaignPlatform.INSTAGRAM);
                campaignDTO.setCategory("Fashion");
                campaignDTO.setRequirements("Test requirements");
                campaignDTO.setStartDate(LocalDate.now().plusDays(7));
                campaignDTO.setEndDate(LocalDate.now().plusDays(37));
                campaignDTO.setApplicationDeadline(LocalDate.now().plusDays(5));
                campaignDTO.setMaxApplicants(50);
                campaignDTO.setStatus(CampaignStatus.DRAFT);

                return campaignService.createCampaign(campaignDTO, testBrand.getId());
        }

        private CampaignDTO createActiveCampaign() {
                // First create a draft campaign
                CampaignDTO campaignDTO = new CampaignDTO();
                campaignDTO.setTitle("Active Campaign");
                campaignDTO.setDescription("Test campaign description that meets minimum length requirements");
                campaignDTO.setBudget(BigDecimal.valueOf(5000));
                campaignDTO.setPlatform(CampaignPlatform.INSTAGRAM);
                campaignDTO.setCategory("Fashion");
                campaignDTO.setRequirements("Test requirements");
                campaignDTO.setStartDate(LocalDate.now().plusDays(7));
                campaignDTO.setEndDate(LocalDate.now().plusDays(37));
                campaignDTO.setApplicationDeadline(LocalDate.now().plusDays(5));
                campaignDTO.setMaxApplicants(50);

                CampaignDTO created = campaignService.createCampaign(campaignDTO, testBrand.getId());

                // Directly update status to ACTIVE via repository (bypassing service
                // validation)
                Campaign campaign = campaignRepository.findById(created.getId()).orElseThrow();
                campaign.setStatus(CampaignStatus.ACTIVE);
                campaignRepository.save(campaign);

                created.setStatus(CampaignStatus.ACTIVE);
                return created;
        }
}
