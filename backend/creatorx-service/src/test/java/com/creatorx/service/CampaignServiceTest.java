package com.creatorx.service;

import com.creatorx.api.dto.CampaignFilterRequest;
import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.CampaignNotFoundException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.SavedCampaignRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.mapper.CampaignMapper;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CampaignService Unit Tests")
class CampaignServiceTest {
    
    @Mock
    private CampaignRepository campaignRepository;
    
    @Mock
    private SavedCampaignRepository savedCampaignRepository;
    
    @Mock
    private ApplicationRepository applicationRepository;
    
    @Mock
    private UserService userService;
    
    @Mock
    private CampaignMapper campaignMapper;
    
    @InjectMocks
    private CampaignService campaignService;
    
    private User brandUser;
    private User creatorUser;
    private Campaign campaign;
    
    @BeforeEach
    void setUp() {
        brandUser = TestDataBuilder.user()
                .asBrand()
                .withEmail("brand@example.com")
                .build();
        
        creatorUser = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@example.com")
                .build();
        
        campaign = TestDataBuilder.campaign()
                .withBrand(brandUser)
                .active()
                .build();
    }
    
    @Test
    @DisplayName("Should get campaigns with filters for creator")
    void testGetCampaigns_CreatorSeesOnlyActive() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        Page<Campaign> campaignPage = new PageImpl<>(List.of(campaign));
        
        when(campaignRepository.findActiveCampaignsByFilters(
                any(), any(), any(), any(), any(Pageable.class)
        )).thenReturn(campaignPage);
        
        when(savedCampaignRepository.existsByCreatorIdAndCampaignId(anyString(), anyString()))
                .thenReturn(false);
        
        CampaignDTO dto = new CampaignDTO();
        dto.setId(campaign.getId());
        when(campaignMapper.toDTO(any(Campaign.class))).thenReturn(dto);
        
        // When
        Page<CampaignDTO> result = campaignService.getCampaigns(
                null, null, null, null, null, null,
                "created_at", "desc", 0, 20, creatorUser
        );
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(campaignRepository).findActiveCampaignsByFilters(
                any(), any(), any(), any(), any(Pageable.class)
        );
    }
    
    @Test
    @DisplayName("Should get campaign by ID for creator")
    void testGetCampaignById_CreatorCanViewActive() {
        // Given
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        
        CampaignDTO dto = new CampaignDTO();
        dto.setId(campaign.getId());
        when(campaignMapper.toDTO(campaign)).thenReturn(dto);
        
        // When
        CampaignDTO result = campaignService.getCampaignById(campaign.getId(), creatorUser);
        
        // Then
        assertNotNull(result);
        assertEquals(campaign.getId(), result.getId());
    }
    
    @Test
    @DisplayName("Should throw exception when creator tries to view draft campaign")
    void testGetCampaignById_CreatorCannotViewDraft() {
        // Given
        campaign.setStatus(CampaignStatus.DRAFT);
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        
        // When/Then
        assertThatThrownBy(() -> campaignService.getCampaignById(campaign.getId(), creatorUser))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("not available");
    }
    
    @Test
    @DisplayName("Should create campaign successfully")
    void testCreateCampaign_Success() {
        // Given
        CampaignDTO campaignDTO = new CampaignDTO();
        campaignDTO.setTitle("New Campaign");
        campaignDTO.setDescription("Description");
        campaignDTO.setBudget(new BigDecimal("5000.00"));
        campaignDTO.setPlatform(CampaignPlatform.INSTAGRAM);
        campaignDTO.setCategory("Tech");
        campaignDTO.setStartDate(LocalDate.now().plusDays(1));
        campaignDTO.setEndDate(LocalDate.now().plusDays(30));
        
        when(userService.findById(brandUser.getId())).thenReturn(brandUser);
        when(campaignMapper.toEntity(campaignDTO)).thenReturn(campaign);
        when(campaignRepository.save(any(Campaign.class))).thenReturn(campaign);
        
        CampaignDTO savedDTO = new CampaignDTO();
        savedDTO.setId(campaign.getId());
        when(campaignMapper.toDTO(campaign)).thenReturn(savedDTO);
        
        // When
        CampaignDTO result = campaignService.createCampaign(campaignDTO, brandUser.getId());
        
        // Then
        assertNotNull(result);
        verify(campaignRepository).save(any(Campaign.class));
        verify(campaign).setBrand(brandUser);
        verify(campaign).setStatus(CampaignStatus.DRAFT);
    }
    
    @Test
    @DisplayName("Should throw exception when non-brand tries to create campaign")
    void testCreateCampaign_OnlyBrandCanCreate() {
        // Given
        CampaignDTO campaignDTO = new CampaignDTO();
        when(userService.findById(creatorUser.getId())).thenReturn(creatorUser);
        when(campaignMapper.toEntity(campaignDTO)).thenReturn(campaign);
        
        // When/Then
        assertThatThrownBy(() -> campaignService.createCampaign(campaignDTO, creatorUser.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Only brands can create campaigns");
    }
    
    @Test
    @DisplayName("Should update campaign successfully")
    void testUpdateCampaign_Success() {
        // Given
        CampaignDTO updateDTO = new CampaignDTO();
        updateDTO.setTitle("Updated Title");
        
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(campaignRepository.save(campaign)).thenReturn(campaign);
        
        CampaignDTO savedDTO = new CampaignDTO();
        when(campaignMapper.toDTO(campaign)).thenReturn(savedDTO);
        
        // When
        CampaignDTO result = campaignService.updateCampaign(campaign.getId(), updateDTO, brandUser.getId());
        
        // Then
        assertNotNull(result);
        verify(campaignRepository).save(campaign);
        assertEquals("Updated Title", campaign.getTitle());
    }
    
    @Test
    @DisplayName("Should throw exception when updating other brand's campaign")
    void testUpdateCampaign_Unauthorized() {
        // Given
        User otherBrand = TestDataBuilder.user().asBrand().withEmail("other@example.com").build();
        CampaignDTO updateDTO = new CampaignDTO();
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        
        // When/Then
        assertThatThrownBy(() -> campaignService.updateCampaign(campaign.getId(), updateDTO, otherBrand.getId()))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("own campaigns");
    }
    
    @Test
    @DisplayName("Should delete draft campaign successfully")
    void testDeleteCampaign_Success() {
        // Given
        campaign.setStatus(CampaignStatus.DRAFT);
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(applicationRepository.countByCampaignId(campaign.getId())).thenReturn(0L);
        
        // When
        campaignService.deleteCampaign(campaign.getId(), brandUser.getId());
        
        // Then
        verify(campaignRepository).delete(campaign);
    }
    
    @Test
    @DisplayName("Should throw exception when deleting campaign with applications")
    void testDeleteCampaign_WithApplications() {
        // Given
        campaign.setStatus(CampaignStatus.DRAFT);
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(applicationRepository.countByCampaignId(campaign.getId())).thenReturn(5L);
        
        // When/Then
        assertThatThrownBy(() -> campaignService.deleteCampaign(campaign.getId(), brandUser.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("existing applications");
    }
    
    @Test
    @DisplayName("Should throw exception when deleting active campaign")
    void testDeleteCampaign_CannotDeleteActive() {
        // Given
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        
        // When/Then
        assertThatThrownBy(() -> campaignService.deleteCampaign(campaign.getId(), brandUser.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Cannot delete active campaigns");
    }
    
    @Test
    @DisplayName("Should save campaign for creator")
    void testSaveCampaign_Success() {
        // Given
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(savedCampaignRepository.existsByCreatorIdAndCampaignId(creatorUser.getId(), campaign.getId()))
                .thenReturn(false);
        when(userService.findById(creatorUser.getId())).thenReturn(creatorUser);
        
        // When
        campaignService.saveCampaign(creatorUser.getId(), campaign.getId());
        
        // Then
        verify(savedCampaignRepository).save(any());
    }
    
    @Test
    @DisplayName("Should throw exception when saving already saved campaign")
    void testSaveCampaign_AlreadySaved() {
        // Given
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(savedCampaignRepository.existsByCreatorIdAndCampaignId(creatorUser.getId(), campaign.getId()))
                .thenReturn(true);
        
        // When/Then
        assertThatThrownBy(() -> campaignService.saveCampaign(creatorUser.getId(), campaign.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already saved");
    }
    
    @Test
    @DisplayName("Should throw CampaignNotFoundException when campaign not found")
    void testGetCampaignById_NotFound() {
        // Given
        String nonExistentId = "non-existent";
        when(campaignRepository.findById(nonExistentId)).thenReturn(Optional.empty());
        
        // When/Then
        assertThatThrownBy(() -> campaignService.getCampaignById(nonExistentId, creatorUser))
                .isInstanceOf(CampaignNotFoundException.class);
    }
    
    @Test
    @DisplayName("Should filter campaigns by category and platform")
    void testGetCampaigns_WithFilters() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        Page<Campaign> campaignPage = new PageImpl<>(List.of(campaign));
        
        when(campaignRepository.findActiveCampaignsByFilters(
                eq("Fashion"),
                eq(CampaignPlatform.INSTAGRAM),
                any(),
                any(),
                any(Pageable.class)
        )).thenReturn(campaignPage);
        
        when(savedCampaignRepository.existsByCreatorIdAndCampaignId(anyString(), anyString()))
                .thenReturn(false);
        
        CampaignDTO dto = new CampaignDTO();
        when(campaignMapper.toDTO(any(Campaign.class))).thenReturn(dto);
        
        // When
        Page<CampaignDTO> result = campaignService.getCampaigns(
                "Fashion",
                CampaignPlatform.INSTAGRAM,
                null,
                null,
                null,
                null,
                "created_at",
                "desc",
                0,
                20,
                creatorUser
        );
        
        // Then
        assertNotNull(result);
        verify(campaignRepository).findActiveCampaignsByFilters(
                eq("Fashion"),
                eq(CampaignPlatform.INSTAGRAM),
                any(),
                any(),
                any(Pageable.class)
        );
    }
    
    @Test
    @DisplayName("Should get active campaigns for creator")
    void testGetActiveCampaigns_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 1000);
        Page<Campaign> campaignPage = new PageImpl<>(List.of(campaign));
        when(campaignRepository.findByStatus(CampaignStatus.ACTIVE, pageable)).thenReturn(campaignPage);
        when(savedCampaignRepository.existsByCreatorIdAndCampaignId(anyString(), anyString()))
                .thenReturn(false);
        
        CampaignDTO dto = new CampaignDTO();
        dto.setId(campaign.getId());
        when(campaignMapper.toDTO(any(Campaign.class))).thenReturn(dto);
        when(campaignMapper.toDTOList(anyList())).thenReturn(List.of(dto));
        
        // When
        List<CampaignDTO> result = campaignService.getActiveCampaigns(creatorUser.getId());
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(campaignRepository).findByStatus(CampaignStatus.ACTIVE, pageable);
    }
    
    @Test
    @DisplayName("Should validate campaign title length")
    void testCreateCampaign_InvalidTitleLength() {
        // Given
        CampaignDTO campaignDTO = new CampaignDTO();
        campaignDTO.setTitle("Hi"); // Too short
        campaignDTO.setDescription("This is a valid description with enough characters");
        campaignDTO.setBudget(new BigDecimal("5000.00"));
        campaignDTO.setPlatform(CampaignPlatform.INSTAGRAM);
        campaignDTO.setCategory("Tech");
        campaignDTO.setStartDate(LocalDate.now().plusDays(1));
        campaignDTO.setEndDate(LocalDate.now().plusDays(30));
        
        when(userService.findById(brandUser.getId())).thenReturn(brandUser);
        
        // When/Then
        assertThatThrownBy(() -> campaignService.createCampaign(campaignDTO, brandUser.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Title must be between 5 and 100 characters");
    }
    
    @Test
    @DisplayName("Should validate campaign description length")
    void testCreateCampaign_InvalidDescriptionLength() {
        // Given
        CampaignDTO campaignDTO = new CampaignDTO();
        campaignDTO.setTitle("Valid Title");
        campaignDTO.setDescription("Short"); // Too short
        campaignDTO.setBudget(new BigDecimal("5000.00"));
        campaignDTO.setPlatform(CampaignPlatform.INSTAGRAM);
        campaignDTO.setCategory("Tech");
        campaignDTO.setStartDate(LocalDate.now().plusDays(1));
        campaignDTO.setEndDate(LocalDate.now().plusDays(30));
        
        when(userService.findById(brandUser.getId())).thenReturn(brandUser);
        
        // When/Then
        assertThatThrownBy(() -> campaignService.createCampaign(campaignDTO, brandUser.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Description must be between 20 and 2000 characters");
    }
    
    @Test
    @DisplayName("Should validate budget is positive")
    void testCreateCampaign_InvalidBudget() {
        // Given
        CampaignDTO campaignDTO = new CampaignDTO();
        campaignDTO.setTitle("Valid Title");
        campaignDTO.setDescription("This is a valid description with enough characters");
        campaignDTO.setBudget(new BigDecimal("-100")); // Negative
        campaignDTO.setPlatform(CampaignPlatform.INSTAGRAM);
        campaignDTO.setCategory("Tech");
        campaignDTO.setStartDate(LocalDate.now().plusDays(1));
        campaignDTO.setEndDate(LocalDate.now().plusDays(30));
        
        when(userService.findById(brandUser.getId())).thenReturn(brandUser);
        
        // When/Then
        assertThatThrownBy(() -> campaignService.createCampaign(campaignDTO, brandUser.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Budget must be greater than 0");
    }
    
    @Test
    @DisplayName("Should validate end date is after start date")
    void testCreateCampaign_InvalidDateRange() {
        // Given
        CampaignDTO campaignDTO = new CampaignDTO();
        campaignDTO.setTitle("Valid Title");
        campaignDTO.setDescription("This is a valid description with enough characters");
        campaignDTO.setBudget(new BigDecimal("5000.00"));
        campaignDTO.setPlatform(CampaignPlatform.INSTAGRAM);
        campaignDTO.setCategory("Tech");
        campaignDTO.setStartDate(LocalDate.now().plusDays(30));
        campaignDTO.setEndDate(LocalDate.now().plusDays(1)); // Before start date
        
        when(userService.findById(brandUser.getId())).thenReturn(brandUser);
        
        // When/Then
        assertThatThrownBy(() -> campaignService.createCampaign(campaignDTO, brandUser.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("End date must be after start date");
    }
    
    @Test
    @DisplayName("Should get campaigns with CampaignFilterRequest")
    void testGetCampaigns_WithFilterRequest() {
        // Given
        CampaignFilterRequest filters = new CampaignFilterRequest();
        filters.setCategory("Fashion");
        filters.setPlatform(CampaignPlatform.INSTAGRAM);
        filters.setBudgetMin(new BigDecimal("1000"));
        filters.setBudgetMax(new BigDecimal("10000"));
        
        Pageable pageable = PageRequest.of(0, 20);
        Page<Campaign> campaignPage = new PageImpl<>(List.of(campaign));
        
        when(campaignRepository.findActiveCampaignsByFilters(
                eq("Fashion"),
                eq(CampaignPlatform.INSTAGRAM),
                eq(new BigDecimal("1000")),
                eq(new BigDecimal("10000")),
                any(Pageable.class)
        )).thenReturn(campaignPage);
        
        when(savedCampaignRepository.existsByCreatorIdAndCampaignId(anyString(), anyString()))
                .thenReturn(false);
        
        CampaignDTO dto = new CampaignDTO();
        when(campaignMapper.toDTO(any(Campaign.class))).thenReturn(dto);
        
        // When
        Page<CampaignDTO> result = campaignService.getCampaigns(filters, pageable, creatorUser);
        
        // Then
        assertNotNull(result);
        verify(campaignRepository).findActiveCampaignsByFilters(
                eq("Fashion"),
                eq(CampaignPlatform.INSTAGRAM),
                eq(new BigDecimal("1000")),
                eq(new BigDecimal("10000")),
                any(Pageable.class)
        );
    }
    
    @Test
    @DisplayName("Should search campaigns with query")
    void testSearchCampaigns_Success() {
        // Given
        String query = "fashion summer";
        Pageable pageable = PageRequest.of(0, 20);
        Page<Campaign> campaignPage = new PageImpl<>(List.of(campaign));
        
        when(campaignRepository.searchCampaignsWithFullText(
                eq("ACTIVE"),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                eq(query),
                any(Pageable.class)
        )).thenReturn(campaignPage);
        
        when(savedCampaignRepository.existsByCreatorIdAndCampaignId(anyString(), anyString()))
                .thenReturn(false);
        
        CampaignDTO dto = new CampaignDTO();
        when(campaignMapper.toDTO(any(Campaign.class))).thenReturn(dto);
        
        // When
        Page<CampaignDTO> result = campaignService.searchCampaigns(query, pageable, creatorUser);
        
        // Then
        assertNotNull(result);
        verify(campaignRepository).searchCampaignsWithFullText(
                eq("ACTIVE"),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                eq(query),
                any(Pageable.class)
        );
    }
}
