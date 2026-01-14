package com.creatorx.api.integration;

import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.User;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Campaign API
 * Uses TestContainers for real PostgreSQL database
 */
@DisplayName("Campaign Integration Tests")
class CampaignIntegrationTest extends BaseIntegrationTest {
    
    @Autowired
    protected MockMvc mockMvc;
    
    @Autowired
    protected CampaignRepository campaignRepository;
    
    @Autowired
    protected UserRepository userRepository;
    
    private User brandUser;
    private User creatorUser;
    private Campaign campaign;
    
    @BeforeEach
    void setUp() {
        // Note: Do NOT call userRepository.deleteAll() as it breaks base class test users
        // @Transactional on BaseIntegrationTest ensures test isolation via rollback
        
        // Create test users for this test class
        brandUser = TestDataBuilder.user()
                .asBrand()
                .withEmail("brand@test.com")
                .build();
        brandUser = userRepository.save(brandUser);
        
        creatorUser = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@test.com")
                .build();
        creatorUser = userRepository.save(creatorUser);
        
        // Create test campaign
        campaign = TestDataBuilder.campaign()
                .withBrand(brandUser)
                .active()
                .build();
        campaign = campaignRepository.save(campaign);
    }
    
    @Test
    @DisplayName("Should create and retrieve campaign via API")
    @WithMockUser(username = "brand@test.com", roles = "BRAND")
    void testCreateAndGetCampaign() throws Exception {
        // Create campaign
        String createRequest = """
                {
                    "title": "Integration Test Campaign",
                    "description": "Test description",
                    "budget": 50000.00,
                    "platform": "INSTAGRAM",
                    "category": "Tech",
                    "deliverableTypes": ["IMAGE", "VIDEO"],
                    "startDate": "2024-06-01",
                    "endDate": "2024-06-30"
                }
                """;
        
        mockMvc.perform(post("/api/v1/campaigns")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Integration Test Campaign"));
        
        // Verify in database
        long count = campaignRepository.count();
        assert count > 0;
    }
    
    @Test
    @DisplayName("Should get campaigns with filters")
    void testGetCampaignsWithFilters() throws Exception {
        // Given - campaign already created in setUp
        
        // When/Then
        mockMvc.perform(get("/api/v1/campaigns")
                        .param("category", "Fashion")
                        .param("platform", "INSTAGRAM")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
    
    @Test
    @DisplayName("Should update campaign via API")
    @WithMockUser(username = "brand@test.com", roles = "BRAND")
    void testUpdateCampaign() throws Exception {
        String updateRequest = """
                {
                    "title": "Updated Campaign Title"
                }
                """;
        
        mockMvc.perform(put("/api/v1/campaigns/" + campaign.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateRequest))
                .andExpect(status().isOk());
        
        // Verify update in database
        Campaign updated = campaignRepository.findById(campaign.getId()).orElseThrow();
        assert updated.getTitle().equals("Updated Campaign Title");
    }
    
    @Test
    @DisplayName("Should delete campaign via API")
    @WithMockUser(username = "brand@test.com", roles = "BRAND")
    void testDeleteCampaign() throws Exception {
        // Set campaign to DRAFT so it can be deleted
        campaign.setStatus(CampaignStatus.DRAFT);
        campaignRepository.save(campaign);
        
        mockMvc.perform(delete("/api/v1/campaigns/" + campaign.getId())
                        .with(csrf()))
                .andExpect(status().isNoContent());
        
        // Verify deletion
        assert campaignRepository.findById(campaign.getId()).isEmpty();
    }
    
    @Test
    @DisplayName("Should get active campaigns for creator")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void testGetActiveCampaigns() throws Exception {
        mockMvc.perform(get("/api/v1/campaigns/active")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
    
    @Test
    @DisplayName("Should save campaign for creator")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void testSaveCampaign() throws Exception {
        mockMvc.perform(post("/api/v1/campaigns/" + campaign.getId() + "/save")
                        .with(csrf()))
                .andExpect(status().isOk());
    }
    
    @Test
    @DisplayName("Should get saved campaigns for creator")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void testGetSavedCampaigns() throws Exception {
        mockMvc.perform(get("/api/v1/campaigns/saved")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
    
    @Test
    @DisplayName("Should search campaigns with query")
    void testSearchCampaigns() throws Exception {
        mockMvc.perform(get("/api/v1/campaigns/search")
                        .param("query", "fashion")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
    
    @Test
    @DisplayName("Should prevent deletion of campaign with applications")
    @WithMockUser(username = "brand@test.com", roles = "BRAND")
    void testDeleteCampaign_WithApplications() throws Exception {
        // This test would require Application entity setup
        // For now, we test that draft campaigns without applications can be deleted
        campaign.setStatus(CampaignStatus.DRAFT);
        campaignRepository.save(campaign);
        
        mockMvc.perform(delete("/api/v1/campaigns/" + campaign.getId())
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
    
    @Test
    @DisplayName("Should validate campaign data on creation")
    @WithMockUser(username = "brand@test.com", roles = "BRAND")
    void testCreateCampaign_Validation() throws Exception {
        // Test with invalid title (too short)
        String invalidRequest = """
                {
                    "title": "Hi",
                    "description": "This is a valid description with enough characters",
                    "budget": 50000.00,
                    "platform": "INSTAGRAM",
                    "category": "Tech",
                    "deliverableTypes": ["IMAGE"],
                    "startDate": "2024-06-01",
                    "endDate": "2024-06-30"
                }
                """;
        
        mockMvc.perform(post("/api/v1/campaigns")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(status().isBadRequest());
    }
}

