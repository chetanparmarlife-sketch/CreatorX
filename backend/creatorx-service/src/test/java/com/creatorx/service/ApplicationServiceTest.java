package com.creatorx.service;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.ApplicationDeadlineException;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.DuplicateApplicationException;
import com.creatorx.common.exception.KYCNotVerifiedException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.ConversationRepository;
import com.creatorx.repository.NotificationRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Application;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.Conversation;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.ApplicationDTO;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.mapper.ApplicationMapper;
import com.creatorx.service.mapper.CampaignMapper;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("ApplicationService Unit Tests")
class ApplicationServiceTest {
    
    @Mock
    private ApplicationRepository applicationRepository;
    
    @Mock
    private CampaignRepository campaignRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private ConversationRepository conversationRepository;
    
    @Mock
    private NotificationRepository notificationRepository;
    
    @Mock
    private ApplicationMapper applicationMapper;
    
    @Mock
    private CampaignMapper campaignMapper;
    
    @Mock
    private KYCService kycService;
    
    @InjectMocks
    private ApplicationService applicationService;
    
    private User creatorUser;
    private User brandUser;
    private Campaign campaign;
    private Application application;
    
    @BeforeEach
    void setUp() {
        creatorUser = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@example.com")
                .build();
        
        brandUser = TestDataBuilder.user()
                .asBrand()
                .withEmail("brand@example.com")
                .build();
        
        campaign = TestDataBuilder.campaign()
                .withBrand(brandUser)
                .active()
                .withApplicationDeadline(LocalDate.now().plusDays(7))
                .build();
        
        application = TestDataBuilder.application()
                .withCreator(creatorUser)
                .withCampaign(campaign)
                .withStatus(ApplicationStatus.APPLIED)
                .build();
    }
    
    @Test
    @DisplayName("Should submit application successfully")
    void testSubmitApplication_Success() {
        // Given
        String pitchText = "I am a creative content creator with 100k followers. I specialize in fashion and lifestyle content.";
        String availability = "Available immediately";
        
        when(userRepository.findById(creatorUser.getId())).thenReturn(Optional.of(creatorUser));
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(applicationRepository.existsByCampaignIdAndCreatorId(campaign.getId(), creatorUser.getId()))
                .thenReturn(false);
        when(applicationRepository.countActiveApplicationsByCreatorId(creatorUser.getId())).thenReturn(5L);
        when(kycService.isKYCVerified(creatorUser.getId())).thenReturn(true);
        
        Application savedApplication = Application.builder()
                .id("app-123")
                .campaign(campaign)
                .creator(creatorUser)
                .status(ApplicationStatus.APPLIED)
                .pitchText(pitchText)
                .expectedTimeline(availability)
                .appliedAt(LocalDateTime.now())
                .build();
        
        when(applicationRepository.save(any(Application.class))).thenReturn(savedApplication);
        
        ApplicationDTO dto = new ApplicationDTO();
        dto.setId(savedApplication.getId());
        when(applicationMapper.toDTO(any(Application.class))).thenReturn(dto);
        
        CampaignDTO campaignDTO = new CampaignDTO();
        when(campaignMapper.toDTO(any(Campaign.class))).thenReturn(campaignDTO);
        
        // When
        ApplicationDTO result = applicationService.submitApplication(
                creatorUser.getId(), campaign.getId(), pitchText, availability);
        
        // Then
        assertNotNull(result);
        verify(applicationRepository).save(any(Application.class));
        verify(notificationRepository).save(any());
    }
    
    @Test
    @DisplayName("Should throw exception for duplicate application")
    void testSubmitApplication_Duplicate() {
        // Given
        when(userRepository.findById(creatorUser.getId())).thenReturn(Optional.of(creatorUser));
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(applicationRepository.existsByCampaignIdAndCreatorId(campaign.getId(), creatorUser.getId()))
                .thenReturn(true);
        
        // When/Then
        assertThatThrownBy(() -> applicationService.submitApplication(
                creatorUser.getId(), campaign.getId(), "pitch", "availability"))
                .isInstanceOf(DuplicateApplicationException.class)
                .hasMessageContaining("already applied");
    }
    
    @Test
    @DisplayName("Should throw exception when campaign is not active")
    void testSubmitApplication_CampaignNotActive() {
        // Given
        campaign.setStatus(CampaignStatus.DRAFT);
        when(userRepository.findById(creatorUser.getId())).thenReturn(Optional.of(creatorUser));
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(applicationRepository.existsByCampaignIdAndCreatorId(campaign.getId(), creatorUser.getId()))
                .thenReturn(false);
        when(kycService.isKYCVerified(creatorUser.getId())).thenReturn(true);
        
        // When/Then
        assertThatThrownBy(() -> applicationService.submitApplication(
                creatorUser.getId(), campaign.getId(), "pitch", "availability"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not active");
    }
    
    @Test
    @DisplayName("Should throw exception when application deadline passed")
    void testSubmitApplication_DeadlinePassed() {
        // Given
        campaign.setApplicationDeadline(LocalDate.now().minusDays(1));
        when(userRepository.findById(creatorUser.getId())).thenReturn(Optional.of(creatorUser));
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(applicationRepository.existsByCampaignIdAndCreatorId(campaign.getId(), creatorUser.getId()))
                .thenReturn(false);
        when(kycService.isKYCVerified(creatorUser.getId())).thenReturn(true);
        
        // When/Then
        assertThatThrownBy(() -> applicationService.submitApplication(
                creatorUser.getId(), campaign.getId(), "pitch", "availability"))
                .isInstanceOf(ApplicationDeadlineException.class)
                .hasMessageContaining("deadline");
    }
    
    @Test
    @DisplayName("Should throw exception when KYC not verified")
    void testSubmitApplication_KYCNotVerified() {
        // Given
        when(userRepository.findById(creatorUser.getId())).thenReturn(Optional.of(creatorUser));
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(applicationRepository.existsByCampaignIdAndCreatorId(campaign.getId(), creatorUser.getId()))
                .thenReturn(false);
        when(kycService.isKYCVerified(creatorUser.getId())).thenReturn(false); // KYC not verified
        
        // When/Then
        assertThatThrownBy(() -> applicationService.submitApplication(
                creatorUser.getId(), campaign.getId(), "pitch", "availability"))
                .isInstanceOf(KYCNotVerifiedException.class)
                .hasMessageContaining("KYC verification");
    }
    
    @Test
    @DisplayName("Should throw exception when max applications reached")
    void testSubmitApplication_MaxApplicationsReached() {
        // Given
        when(userRepository.findById(creatorUser.getId())).thenReturn(Optional.of(creatorUser));
        when(campaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(applicationRepository.existsByCampaignIdAndCreatorId(campaign.getId(), creatorUser.getId()))
                .thenReturn(false);
        when(applicationRepository.countActiveApplicationsByCreatorId(creatorUser.getId())).thenReturn(50L);
        when(kycService.isKYCVerified(creatorUser.getId())).thenReturn(true);
        
        // When/Then
        assertThatThrownBy(() -> applicationService.submitApplication(
                creatorUser.getId(), campaign.getId(), "pitch", "availability"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Maximum limit");
    }
    
    @Test
    @DisplayName("Should get applications for creator")
    void testGetApplications_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 20);
        Page<Application> applicationPage = new PageImpl<>(List.of(application));
        
        when(applicationRepository.findByCreatorId(creatorUser.getId(), pageable)).thenReturn(applicationPage);
        
        ApplicationDTO dto = new ApplicationDTO();
        when(applicationMapper.toDTO(any(Application.class))).thenReturn(dto);
        
        CampaignDTO campaignDTO = new CampaignDTO();
        when(campaignMapper.toDTO(any(Campaign.class))).thenReturn(campaignDTO);
        
        // When
        Page<ApplicationDTO> result = applicationService.getApplications(creatorUser.getId(), pageable);
        
        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }
    
    @Test
    @DisplayName("Should withdraw application successfully")
    void testWithdrawApplication_Success() {
        // Given
        application.setStatus(ApplicationStatus.APPLIED);
        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        
        // When
        applicationService.withdrawApplication(creatorUser.getId(), application.getId());
        
        // Then
        verify(applicationRepository).save(application);
        assertEquals(ApplicationStatus.WITHDRAWN, application.getStatus());
        verify(notificationRepository).save(any());
    }
    
    @Test
    @DisplayName("Should throw exception when withdrawing non-APPLIED application")
    void testWithdrawApplication_InvalidStatus() {
        // Given
        application.setStatus(ApplicationStatus.SHORTLISTED);
        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        
        // When/Then
        assertThatThrownBy(() -> applicationService.withdrawApplication(creatorUser.getId(), application.getId()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Only applications with APPLIED status");
    }
    
    @Test
    @DisplayName("Should shortlist application successfully")
    void testShortlistApplication_Success() {
        // Given
        application.setStatus(ApplicationStatus.APPLIED);
        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        
        // When
        applicationService.shortlistApplication(brandUser.getId(), application.getId());
        
        // Then
        verify(applicationRepository).save(application);
        assertEquals(ApplicationStatus.SHORTLISTED, application.getStatus());
        verify(notificationRepository).save(any());
    }
    
    @Test
    @DisplayName("Should select application and create conversation")
    void testSelectApplication_Success() {
        // Given
        application.setStatus(ApplicationStatus.SHORTLISTED);
        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        when(conversationRepository.findByCreatorAndBrandAndCampaign(
                creatorUser.getId(), brandUser.getId(), campaign.getId()))
                .thenReturn(Optional.empty());
        
        Conversation conversation = Conversation.builder()
                .id("conv-123")
                .creator(creatorUser)
                .brand(brandUser)
                .campaign(campaign)
                .build();
        when(conversationRepository.save(any(Conversation.class))).thenReturn(conversation);
        
        // When
        applicationService.selectApplication(brandUser.getId(), application.getId());
        
        // Then
        verify(applicationRepository).save(application);
        assertEquals(ApplicationStatus.SELECTED, application.getStatus());
        verify(conversationRepository).save(any(Conversation.class));
        verify(notificationRepository).save(any());
    }
    
    @Test
    @DisplayName("Should reject application successfully")
    void testRejectApplication_Success() {
        // Given
        application.setStatus(ApplicationStatus.APPLIED);
        String reason = "Does not meet requirements";
        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        
        // When
        applicationService.rejectApplication(brandUser.getId(), application.getId(), reason);
        
        // Then
        verify(applicationRepository).save(application);
        assertEquals(ApplicationStatus.REJECTED, application.getStatus());
        verify(notificationRepository).save(any());
    }
}

