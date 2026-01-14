package com.creatorx.service;

import com.creatorx.common.enums.DocumentStatus;
import com.creatorx.common.enums.DocumentType;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.common.exception.UnauthorizedException;
import com.creatorx.repository.KYCDocumentRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.KYCDocument;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.FileUploadResponse;
import com.creatorx.service.dto.KYCDocumentDTO;
import com.creatorx.service.dto.KYCStatusDTO;
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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("KYCService Unit Tests")
class KYCServiceTest {
    
    @Mock
    private KYCDocumentRepository kycDocumentRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private SupabaseStorageService storageService;
    
    @Mock
    private NotificationService notificationService;
    
    @InjectMocks
    private KYCService kycService;
    
    private User user;
    private User admin;
    private KYCDocument kycDocument;
    private MultipartFile frontImage;
    private MultipartFile backImage;
    
    @BeforeEach
    void setUp() {
        user = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@example.com")
                .build();
        
        admin = TestDataBuilder.user()
                .asAdmin()
                .withEmail("admin@example.com")
                .build();
        
        kycDocument = KYCDocument.builder()
                .id("kyc-doc-id")
                .user(user)
                .documentType(DocumentType.AADHAAR)
                .documentNumber("123456789012")
                .documentUrl("https://storage.example.com/kyc/front.jpg")
                .status(DocumentStatus.PENDING)
                .build();
        
        frontImage = mock(MultipartFile.class);
        backImage = mock(MultipartFile.class);
    }
    
    @Test
    @DisplayName("Should submit KYC document successfully")
    void shouldSubmitKYCDocumentSuccessfully() {
        // Given
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kycDocumentRepository.findPendingByUserIdAndDocumentType(user.getId(), DocumentType.AADHAAR))
                .thenReturn(Optional.empty());
        
        FileUploadResponse frontUpload = FileUploadResponse.builder()
                .fileUrl("https://storage.example.com/kyc/front.jpg")
                .build();
        
        when(storageService.uploadKYCDocument(eq(user.getId()), eq("AADHAAR"), any()))
                .thenReturn(frontUpload);
        
        when(kycDocumentRepository.save(any())).thenReturn(kycDocument);
        
        // When
        KYCDocumentDTO result = kycService.submitKYC(
                user.getId(),
                DocumentType.AADHAAR,
                "123456789012",
                frontImage,
                null
        );
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getDocumentType()).isEqualTo(DocumentType.AADHAAR);
        verify(kycDocumentRepository).save(any());
    }
    
    @Test
    @DisplayName("Should submit AADHAAR with back image")
    void shouldSubmitAADHAARWithBackImage() {
        // Given
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kycDocumentRepository.findPendingByUserIdAndDocumentType(user.getId(), DocumentType.AADHAAR))
                .thenReturn(Optional.empty());
        
        FileUploadResponse frontUpload = FileUploadResponse.builder()
                .fileUrl("https://storage.example.com/kyc/front.jpg")
                .build();
        
        FileUploadResponse backUpload = FileUploadResponse.builder()
                .fileUrl("https://storage.example.com/kyc/back.jpg")
                .build();
        
        when(storageService.uploadKYCDocument(eq(user.getId()), eq("AADHAAR"), any()))
                .thenReturn(frontUpload);
        when(storageService.uploadKYCDocument(eq(user.getId()), eq("AADHAAR_back"), any()))
                .thenReturn(backUpload);
        
        when(kycDocumentRepository.save(any())).thenReturn(kycDocument);
        
        // When
        KYCDocumentDTO result = kycService.submitKYC(
                user.getId(),
                DocumentType.AADHAAR,
                "123456789012",
                frontImage,
                backImage
        );
        
        // Then
        assertThat(result).isNotNull();
        verify(storageService, times(2)).uploadKYCDocument(anyString(), anyString(), any());
    }
    
    @Test
    @DisplayName("Should throw exception when pending document exists")
    void shouldThrowExceptionWhenPendingDocumentExists() {
        // Given
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kycDocumentRepository.findPendingByUserIdAndDocumentType(user.getId(), DocumentType.AADHAAR))
                .thenReturn(Optional.of(kycDocument));
        
        // When/Then
        assertThatThrownBy(() -> kycService.submitKYC(
                user.getId(),
                DocumentType.AADHAAR,
                "123456789012",
                frontImage,
                null
        )).isInstanceOf(BusinessException.class)
                .hasMessageContaining("already have a pending");
    }
    
    @Test
    @DisplayName("Should validate Aadhaar number format")
    void shouldValidateAadhaarNumberFormat() {
        // Given
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kycDocumentRepository.findPendingByUserIdAndDocumentType(user.getId(), DocumentType.AADHAAR))
                .thenReturn(Optional.empty());
        
        // When/Then - Invalid format
        assertThatThrownBy(() -> kycService.submitKYC(
                user.getId(),
                DocumentType.AADHAAR,
                "12345", // Invalid: not 12 digits
                frontImage,
                null
        )).isInstanceOf(BusinessException.class)
                .hasMessageContaining("12 digits");
    }
    
    @Test
    @DisplayName("Should validate PAN number format")
    void shouldValidatePANNumberFormat() {
        // Given
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kycDocumentRepository.findPendingByUserIdAndDocumentType(user.getId(), DocumentType.PAN))
                .thenReturn(Optional.empty());
        
        // When/Then - Invalid format
        assertThatThrownBy(() -> kycService.submitKYC(
                user.getId(),
                DocumentType.PAN,
                "INVALID", // Invalid format
                frontImage,
                null
        )).isInstanceOf(BusinessException.class)
                .hasMessageContaining("PAN number");
    }
    
    @Test
    @DisplayName("Should get KYC status")
    void shouldGetKYCStatus() {
        // Given
        KYCDocument approvedDoc = KYCDocument.builder()
                .id("doc-1")
                .user(user)
                .documentType(DocumentType.AADHAAR)
                .status(DocumentStatus.APPROVED)
                .build();
        
        when(kycDocumentRepository.findByUserId(user.getId()))
                .thenReturn(Arrays.asList(approvedDoc));
        when(kycDocumentRepository.countApprovedByUserId(user.getId()))
                .thenReturn(1L);
        
        // When
        KYCStatusDTO status = kycService.getKYCStatus(user.getId());
        
        // Then
        assertThat(status).isNotNull();
        assertThat(status.isVerified()).isTrue();
        assertThat(status.getOverallStatus()).isEqualTo("APPROVED");
    }
    
    @Test
    @DisplayName("Should approve KYC document")
    void shouldApproveKYCDocument() {
        // Given
        when(kycDocumentRepository.findById("kyc-doc-id"))
                .thenReturn(Optional.of(kycDocument));
        when(userRepository.findById(admin.getId()))
                .thenReturn(Optional.of(admin));
        when(kycDocumentRepository.save(any())).thenReturn(kycDocument);
        when(kycDocumentRepository.countApprovedByUserId(user.getId()))
                .thenReturn(1L);
        
        // When
        kycService.approveKYC(admin.getId(), "kyc-doc-id");
        
        // Then
        assertThat(kycDocument.getStatus()).isEqualTo(DocumentStatus.APPROVED);
        assertThat(kycDocument.getVerifiedBy()).isEqualTo(admin);
        assertThat(kycDocument.getVerifiedAt()).isNotNull();
        verify(kycDocumentRepository).save(kycDocument);
    }
    
    @Test
    @DisplayName("Should throw exception when non-admin tries to approve")
    void shouldThrowExceptionWhenNonAdminTriesToApprove() {
        // Given
        when(kycDocumentRepository.findById("kyc-doc-id"))
                .thenReturn(Optional.of(kycDocument));
        when(userRepository.findById(user.getId()))
                .thenReturn(Optional.of(user)); // Not admin
        
        // When/Then
        assertThatThrownBy(() -> kycService.approveKYC(user.getId(), "kyc-doc-id"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Only admins");
    }
    
    @Test
    @DisplayName("Should reject KYC document")
    void shouldRejectKYCDocument() {
        // Given
        when(kycDocumentRepository.findById("kyc-doc-id"))
                .thenReturn(Optional.of(kycDocument));
        when(userRepository.findById(admin.getId()))
                .thenReturn(Optional.of(admin));
        when(kycDocumentRepository.save(any())).thenReturn(kycDocument);
        
        // When
        kycService.rejectKYC(admin.getId(), "kyc-doc-id", "Document is unclear");
        
        // Then
        assertThat(kycDocument.getStatus()).isEqualTo(DocumentStatus.REJECTED);
        assertThat(kycDocument.getRejectionReason()).isEqualTo("Document is unclear");
        verify(kycDocumentRepository).save(kycDocument);
    }
    
    @Test
    @DisplayName("Should check if user is KYC verified")
    void shouldCheckIfUserIsKYCVerified() {
        // Given
        when(kycDocumentRepository.countApprovedByUserId(user.getId()))
                .thenReturn(1L);
        
        // When
        boolean isVerified = kycService.isKYCVerified(user.getId());
        
        // Then
        assertThat(isVerified).isTrue();
    }
}

