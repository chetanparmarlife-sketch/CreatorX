package com.creatorx.service;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.CampaignDeliverableRepository;
import com.creatorx.repository.DeliverableRepository;
import com.creatorx.repository.NotificationRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Application;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.CampaignDeliverable;
import com.creatorx.repository.entity.DeliverableSubmission;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.DeliverableDTO;
import com.creatorx.service.dto.FileUploadResponse;
import com.creatorx.service.mapper.DeliverableMapper;
import com.creatorx.service.storage.FileValidationService;
import com.creatorx.service.storage.SupabaseStorageService;
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
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("DeliverableService Unit Tests")
class DeliverableServiceTest {
    
    @Mock
    private DeliverableRepository deliverableRepository;
    
    @Mock
    private ApplicationRepository applicationRepository;
    
    @Mock
    private CampaignDeliverableRepository campaignDeliverableRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private NotificationService notificationService;
    
    @Mock
    private DeliverableMapper deliverableMapper;
    
    @Mock
    private SupabaseStorageService storageService;
    
    @InjectMocks
    private DeliverableService deliverableService;
    
    private User creatorUser;
    private User brandUser;
    private Campaign campaign;
    private Application application;
    private CampaignDeliverable campaignDeliverable;
    private MultipartFile mockFile;
    
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
                .build();
        
        application = TestDataBuilder.application()
                .withCampaign(campaign)
                .withCreator(creatorUser)
                .withStatus(ApplicationStatus.SELECTED)
                .build();
        
        campaignDeliverable = CampaignDeliverable.builder()
                .id("deliverable-id")
                .campaign(campaign)
                .title("Instagram Post")
                .description("Create an Instagram post")
                .type(CampaignDeliverable.DeliverableType.POST)
                .build();
        
        mockFile = mock(MultipartFile.class);
        lenient().when(mockFile.isEmpty()).thenReturn(false);
        lenient().when(mockFile.getOriginalFilename()).thenReturn("test.jpg");
        lenient().when(mockFile.getContentType()).thenReturn("image/jpeg");
        lenient().when(mockFile.getSize()).thenReturn(1024L);
    }
    
    @Test
    @DisplayName("Should get deliverables for creator")
    void shouldGetDeliverablesForCreator() {
        // Given
        DeliverableSubmission submission = DeliverableSubmission.builder()
                .id("submission-id")
                .application(application)
                .campaignDeliverable(campaignDeliverable)
                .status(SubmissionStatus.PENDING)
                .build();
        
        Page<DeliverableSubmission> page = new PageImpl<>(List.of(submission));
        when(deliverableRepository.findByCreatorId(eq(creatorUser.getId()), any(Pageable.class)))
                .thenReturn(page);
        
        DeliverableDTO dto = DeliverableDTO.builder()
                .id("submission-id")
                .status(SubmissionStatus.PENDING)
                .build();
        when(deliverableMapper.toDTO(any())).thenReturn(dto);
        when(deliverableRepository.countByApplicationIdAndCampaignDeliverableId(anyString(), anyString()))
                .thenReturn(1L);
        Page<DeliverableSubmission> latestPage = new PageImpl<>(List.of(submission));
        when(deliverableRepository.findLatestByApplicationIdAndCampaignDeliverableId(anyString(), anyString(), any(Pageable.class)))
                .thenReturn(latestPage);
        
        // When
        List<DeliverableDTO> result = deliverableService.getDeliverables(creatorUser.getId(), null);
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("submission-id");
        verify(deliverableRepository).findByCreatorId(eq(creatorUser.getId()), any(Pageable.class));
    }
    
    @Test
    @DisplayName("Should submit deliverable successfully")
    void shouldSubmitDeliverableSuccessfully() {
        // Given
        when(applicationRepository.findById(application.getId()))
                .thenReturn(Optional.of(application));
        when(campaignDeliverableRepository.findById(campaignDeliverable.getId()))
                .thenReturn(Optional.of(campaignDeliverable));
        when(deliverableRepository.findLatestByApplicationIdAndCampaignDeliverableId(
                eq(application.getId()), eq(campaignDeliverable.getId()), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));
        
        FileUploadResponse uploadResponse = FileUploadResponse.builder()
                .fileUrl("https://storage.example.com/file.jpg")
                .fileName("file.jpg")
                .build();
        when(storageService.uploadFile(any(), eq("deliverables"), anyString(), 
                eq(FileValidationService.FileCategory.DELIVERABLE)))
                .thenReturn(uploadResponse);
        
        DeliverableSubmission savedSubmission = DeliverableSubmission.builder()
                .id("submission-id")
                .application(application)
                .campaignDeliverable(campaignDeliverable)
                .fileUrl(uploadResponse.getFileUrl())
                .status(SubmissionStatus.PENDING)
                .build();
        when(deliverableRepository.save(any())).thenReturn(savedSubmission);
        when(deliverableRepository.countByApplicationIdAndCampaignDeliverableId(anyString(), anyString()))
                .thenReturn(1L);
        
        DeliverableDTO dto = DeliverableDTO.builder()
                .id("submission-id")
                .fileUrl(uploadResponse.getFileUrl())
                .status(SubmissionStatus.PENDING)
                .build();
        when(deliverableMapper.toDTO(any())).thenReturn(dto);
        
        // When
        DeliverableDTO result = deliverableService.submitDeliverable(
                creatorUser.getId(),
                application.getId(),
                campaignDeliverable.getId(),
                mockFile,
                "Test description for deliverable submission"
        );
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFileUrl()).isEqualTo(uploadResponse.getFileUrl());
        verify(storageService).uploadFile(any(), eq("deliverables"), anyString(), 
                eq(FileValidationService.FileCategory.DELIVERABLE));
        verify(deliverableRepository).save(any());
        verify(notificationService).createNotification(anyString(), any(), anyString(), anyString(), any());
    }
    
    @Test
    @DisplayName("Should throw exception when application not found")
    void shouldThrowExceptionWhenApplicationNotFound() {
        // Given
        when(applicationRepository.findById(application.getId()))
                .thenReturn(Optional.empty());
        
        // When/Then
        assertThatThrownBy(() -> deliverableService.submitDeliverable(
                creatorUser.getId(),
                application.getId(),
                campaignDeliverable.getId(),
                mockFile,
                "Test description"
        )).isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Application");
    }
    
    @Test
    @DisplayName("Should throw exception when creator does not own application")
    void shouldThrowExceptionWhenCreatorDoesNotOwnApplication() {
        // Given
        User otherCreator = TestDataBuilder.user()
                .asCreator()
                .withEmail("other@example.com")
                .build();
        Application otherApplication = TestDataBuilder.application()
                .withCampaign(campaign)
                .withCreator(otherCreator)
                .build();
        
        when(applicationRepository.findById(otherApplication.getId()))
                .thenReturn(Optional.of(otherApplication));
        
        // When/Then
        assertThatThrownBy(() -> deliverableService.submitDeliverable(
                creatorUser.getId(),
                otherApplication.getId(),
                campaignDeliverable.getId(),
                mockFile,
                "Test description"
        )).isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("own applications");
    }
    
    @Test
    @DisplayName("Should throw exception when application is not SELECTED")
    void shouldThrowExceptionWhenApplicationNotSelected() {
        // Given
        application.setStatus(ApplicationStatus.APPLIED);
        when(applicationRepository.findById(application.getId()))
                .thenReturn(Optional.of(application));
        
        // When/Then
        assertThatThrownBy(() -> deliverableService.submitDeliverable(
                creatorUser.getId(),
                application.getId(),
                campaignDeliverable.getId(),
                mockFile,
                "Test description"
        )).isInstanceOf(BusinessException.class)
                .hasMessageContaining("SELECTED");
    }
    
    @Test
    @DisplayName("Should throw exception when campaign deliverable does not belong to campaign")
    void shouldThrowExceptionWhenCampaignDeliverableDoesNotBelongToCampaign() {
        // Given
        Campaign otherCampaign = TestDataBuilder.campaign()
                .withBrand(brandUser)
                .active()
                .build();
        CampaignDeliverable otherDeliverable = CampaignDeliverable.builder()
                .id("other-deliverable-id")
                .campaign(otherCampaign)
                .title("Other Deliverable")
                .build();
        
        when(applicationRepository.findById(application.getId()))
                .thenReturn(Optional.of(application));
        when(campaignDeliverableRepository.findById(otherDeliverable.getId()))
                .thenReturn(Optional.of(otherDeliverable));
        
        // When/Then
        assertThatThrownBy(() -> deliverableService.submitDeliverable(
                creatorUser.getId(),
                application.getId(),
                otherDeliverable.getId(),
                mockFile,
                "Test description"
        )).isInstanceOf(BusinessException.class)
                .hasMessageContaining("does not belong");
    }
    
    @Test
    @DisplayName("Should throw exception when description is too short")
    void shouldThrowExceptionWhenDescriptionTooShort() {
        // Given
        when(applicationRepository.findById(application.getId()))
                .thenReturn(Optional.of(application));
        when(campaignDeliverableRepository.findById(campaignDeliverable.getId()))
                .thenReturn(Optional.of(campaignDeliverable));
        
        // When/Then
        assertThatThrownBy(() -> deliverableService.submitDeliverable(
                creatorUser.getId(),
                application.getId(),
                campaignDeliverable.getId(),
                mockFile,
                "Short" // Less than 20 characters
        )).isInstanceOf(BusinessException.class)
                .hasMessageContaining("20 and 500 characters");
    }
    
    @Test
    @DisplayName("Should resubmit deliverable after revision request")
    void shouldResubmitDeliverableAfterRevisionRequest() {
        // Given
        DeliverableSubmission existingSubmission = DeliverableSubmission.builder()
                .id("submission-id")
                .application(application)
                .campaignDeliverable(campaignDeliverable)
                .fileUrl("https://storage.example.com/old-file.jpg")
                .status(SubmissionStatus.REVISION_REQUESTED)
                .build();
        
        when(deliverableRepository.findById("submission-id"))
                .thenReturn(Optional.of(existingSubmission));
        
        FileUploadResponse uploadResponse = FileUploadResponse.builder()
                .fileUrl("https://storage.example.com/new-file.jpg")
                .fileName("new-file.jpg")
                .build();
        when(storageService.uploadFile(any(), eq("deliverables"), anyString(), 
                eq(FileValidationService.FileCategory.DELIVERABLE)))
                .thenReturn(uploadResponse);
        
        when(deliverableRepository.save(any())).thenReturn(existingSubmission);
    
    // Stub for enrichDeliverableDTO
    when(deliverableRepository.countByApplicationIdAndCampaignDeliverableId(anyString(), anyString()))
            .thenReturn(1L);
    Page<DeliverableSubmission> page = new PageImpl<>(List.of(existingSubmission));
    when(deliverableRepository.findLatestByApplicationIdAndCampaignDeliverableId(anyString(), anyString(), any(Pageable.class)))
            .thenReturn(page);
        
        DeliverableDTO dto = DeliverableDTO.builder()
                .id("submission-id")
                .fileUrl(uploadResponse.getFileUrl())
                .status(SubmissionStatus.PENDING)
                .build();
        when(deliverableMapper.toDTO(any())).thenReturn(dto);
        
        // When
        DeliverableDTO result = deliverableService.resubmitDeliverable(
                creatorUser.getId(),
                "submission-id",
                mockFile,
                "Updated description for deliverable resubmission"
        );
        
        // Then
        assertThat(result).isNotNull();
        verify(storageService).deleteFile("https://storage.example.com/old-file.jpg");
        verify(storageService).uploadFile(any(), eq("deliverables"), anyString(), 
                eq(FileValidationService.FileCategory.DELIVERABLE));
        verify(deliverableRepository).save(any());
    }
    
    @Test
    @DisplayName("Should throw exception when resubmitting non-REVISION_REQUESTED deliverable")
    void shouldThrowExceptionWhenResubmittingNonRevisionRequestedDeliverable() {
        // Given
        DeliverableSubmission submission = DeliverableSubmission.builder()
                .id("submission-id")
                .application(application)
                .campaignDeliverable(campaignDeliverable)
                .status(SubmissionStatus.PENDING)
                .build();
        
        when(deliverableRepository.findById("submission-id"))
                .thenReturn(Optional.of(submission));
        
        // When/Then
        assertThatThrownBy(() -> deliverableService.resubmitDeliverable(
                creatorUser.getId(),
                "submission-id",
                mockFile,
                "Description"
        )).isInstanceOf(BusinessException.class)
                .hasMessageContaining("REVISION_REQUESTED");
    }
    
    @Test
    @DisplayName("Should review deliverable successfully")
    void shouldReviewDeliverableSuccessfully() {
        // Given
        DeliverableSubmission submission = DeliverableSubmission.builder()
                .id("submission-id")
                .application(application)
                .campaignDeliverable(campaignDeliverable)
                .status(SubmissionStatus.PENDING)
                .build();
        
        when(deliverableRepository.findById("submission-id"))
                .thenReturn(Optional.of(submission));
        when(userRepository.findById(brandUser.getId()))
                .thenReturn(Optional.of(brandUser));
        when(deliverableRepository.save(any())).thenReturn(submission);
        
        // When
        deliverableService.reviewDeliverable(
                brandUser.getId(),
                "submission-id",
                SubmissionStatus.APPROVED,
                "Great work!"
        );
        
        // Then
        verify(deliverableRepository).save(any());
        verify(notificationService).createNotification(anyString(), any(), anyString(), anyString(), any());
    }
    
    @Test
    @DisplayName("Should throw exception when brand does not own campaign")
    void shouldThrowExceptionWhenBrandDoesNotOwnCampaign() {
        // Given
        User otherBrand = TestDataBuilder.user()
                .asBrand()
                .withEmail("otherbrand@example.com")
                .build();
        Campaign otherCampaign = TestDataBuilder.campaign()
                .withBrand(otherBrand)
                .active()
                .build();
        Application otherApplication = TestDataBuilder.application()
                .withCampaign(otherCampaign)
                .withCreator(creatorUser)
                .build();
        
        DeliverableSubmission submission = DeliverableSubmission.builder()
                .id("submission-id")
                .application(otherApplication)
                .campaignDeliverable(campaignDeliverable)
                .status(SubmissionStatus.PENDING)
                .build();
        
        when(deliverableRepository.findById("submission-id"))
                .thenReturn(Optional.of(submission));
        
        // When/Then
        assertThatThrownBy(() -> deliverableService.reviewDeliverable(
                brandUser.getId(),
                "submission-id",
                SubmissionStatus.APPROVED,
                "Feedback"
        )).isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("own campaigns");
    }
}

