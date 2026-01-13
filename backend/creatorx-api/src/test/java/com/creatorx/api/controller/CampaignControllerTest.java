package com.creatorx.api.controller;

import com.creatorx.api.dto.CampaignCreateRequest;
import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.service.CampaignService;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.mapper.CampaignMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CampaignController.class)
@DisplayName("CampaignController API Tests")
class CampaignControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private CampaignService campaignService;
    
    @MockBean
    private CampaignMapper campaignMapper;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private CampaignDTO campaignDTO;
    private CampaignCreateRequest createRequest;
    
    @BeforeEach
    void setUp() {
        campaignDTO = CampaignDTO.builder()
                .id("campaign-1")
                .title("Test Campaign")
                .description("Test Description")
                .budget(new BigDecimal("10000.00"))
                .platform(CampaignPlatform.INSTAGRAM)
                .category("Fashion")
                .status(CampaignStatus.ACTIVE)
                .build();
        
        createRequest = new CampaignCreateRequest();
        createRequest.setTitle("New Campaign");
        createRequest.setDescription("Description");
        createRequest.setBudget(new BigDecimal("5000.00"));
        createRequest.setPlatform(CampaignPlatform.INSTAGRAM);
        createRequest.setCategory("Tech");
        createRequest.setDeliverableTypes(List.of("IMAGE", "VIDEO"));
        createRequest.setStartDate(LocalDate.now().plusDays(1));
        createRequest.setEndDate(LocalDate.now().plusDays(30));
    }
    
    @Test
    @DisplayName("GET /api/v1/campaigns should return paginated campaigns")
    void testGetCampaigns_Success() throws Exception {
        // Given
        Page<CampaignDTO> page = new PageImpl<>(List.of(campaignDTO));
        when(campaignService.getCampaigns(
                any(), any(), any(), any(), any(), any(),
                anyString(), anyString(), anyInt(), anyInt(), any()
        )).thenReturn(page);
        
        // When/Then
        mockMvc.perform(get("/api/v1/campaigns")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value("campaign-1"))
                .andExpect(jsonPath("$.content[0].title").value("Test Campaign"));
    }
    
    @Test
    @DisplayName("GET /api/v1/campaigns/{id} should return campaign details")
    void testGetCampaignById_Success() throws Exception {
        // Given
        when(campaignService.getCampaignById("campaign-1", any())).thenReturn(campaignDTO);
        
        // When/Then
        mockMvc.perform(get("/api/v1/campaigns/campaign-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("campaign-1"))
                .andExpect(jsonPath("$.title").value("Test Campaign"));
    }
    
    @Test
    @DisplayName("POST /api/v1/campaigns should create campaign (Brand only)")
    @WithMockUser(roles = "BRAND")
    void testCreateCampaign_Success() throws Exception {
        // Given
        when(campaignService.createCampaign(any(CampaignDTO.class), anyString()))
                .thenReturn(campaignDTO);
        
        // When/Then
        mockMvc.perform(post("/api/v1/campaigns")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("campaign-1"));
    }
    
    @Test
    @DisplayName("POST /api/v1/campaigns should return 403 for non-brand users")
    @WithMockUser(roles = "CREATOR")
    void testCreateCampaign_Forbidden() throws Exception {
        // When/Then
        mockMvc.perform(post("/api/v1/campaigns")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isForbidden());
    }
    
    @Test
    @DisplayName("POST /api/v1/campaigns should return 400 for invalid request")
    @WithMockUser(roles = "BRAND")
    void testCreateCampaign_ValidationError() throws Exception {
        // Given
        createRequest.setTitle(""); // Invalid
        
        // When/Then
        mockMvc.perform(post("/api/v1/campaigns")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    @DisplayName("PUT /api/v1/campaigns/{id} should update campaign")
    @WithMockUser(roles = "BRAND")
    void testUpdateCampaign_Success() throws Exception {
        // Given
        when(campaignService.updateCampaign(eq("campaign-1"), any(CampaignDTO.class), anyString()))
                .thenReturn(campaignDTO);
        
        // When/Then
        mockMvc.perform(put("/api/v1/campaigns/campaign-1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Updated Title\"}"))
                .andExpect(status().isOk());
    }
    
    @Test
    @DisplayName("DELETE /api/v1/campaigns/{id} should delete campaign")
    @WithMockUser(roles = "BRAND")
    void testDeleteCampaign_Success() throws Exception {
        // Given
        doNothing().when(campaignService).deleteCampaign("campaign-1", anyString());
        
        // When/Then
        mockMvc.perform(delete("/api/v1/campaigns/campaign-1")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
    
    @Test
    @DisplayName("POST /api/v1/campaigns/{id}/save should save campaign (Creator only)")
    @WithMockUser(roles = "CREATOR")
    void testSaveCampaign_Success() throws Exception {
        // Given
        doNothing().when(campaignService).saveCampaign(anyString(), eq("campaign-1"));
        
        // When/Then
        mockMvc.perform(post("/api/v1/campaigns/campaign-1/save")
                        .with(csrf()))
                .andExpect(status().isOk());
    }
    
    @Test
    @DisplayName("GET /api/v1/campaigns/saved should return saved campaigns")
    @WithMockUser(roles = "CREATOR")
    void testGetSavedCampaigns_Success() throws Exception {
        // Given
        when(campaignService.getSavedCampaigns(anyString()))
                .thenReturn(List.of(campaignDTO));
        
        // When/Then
        mockMvc.perform(get("/api/v1/campaigns/saved"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value("campaign-1"));
    }
}
