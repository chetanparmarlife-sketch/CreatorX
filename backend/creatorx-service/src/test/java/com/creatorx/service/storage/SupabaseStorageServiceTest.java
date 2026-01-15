package com.creatorx.service.storage;

import com.creatorx.common.exception.BusinessException;
import com.creatorx.service.dto.FileUploadResponse;
import com.creatorx.service.dto.SignedUrlResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("SupabaseStorageService Unit Tests")
class SupabaseStorageServiceTest {

        @Mock
        private FileValidationService fileValidationService;

        @Mock
        private SupabaseStorageClient storageClient;

        @InjectMocks
        private SupabaseStorageService storageService;

        private MultipartFile multipartFile;

        @BeforeEach
        void setUp() throws IOException {
                multipartFile = mock(MultipartFile.class);
                lenient().when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
                lenient().when(multipartFile.getContentType()).thenReturn("image/jpeg");
                lenient().when(multipartFile.getSize()).thenReturn(1024L);
                lenient().when(multipartFile.getInputStream()).thenReturn(mock(InputStream.class));

                // Stub validateFile to do nothing (prevents BusinessException)
                lenient().doNothing().when(fileValidationService).validateFile(any(), any());

                // Inject @Value fields that are null without Spring context
                ReflectionTestUtils.setField(storageService, "avatarsBucket", "avatars");
                ReflectionTestUtils.setField(storageService, "kycBucket", "kyc-documents");
                ReflectionTestUtils.setField(storageService, "deliverablesBucket", "deliverables");
                ReflectionTestUtils.setField(storageService, "portfolioBucket", "portfolio");
        }

        @Test
        @DisplayName("Should upload file successfully")
        void shouldUploadFileSuccessfully() {
                // Given
                String bucket = "avatars";
                String folder = "users/123";
                String fileUrl = "https://storage.example.com/avatars/users/123/uuid.jpg";

                when(fileValidationService.getFileExtension("image/jpeg")).thenReturn("jpg");
                when(storageClient.uploadFile(any(), eq(bucket), anyString(), eq("image/jpeg"), eq(1024L)))
                                .thenReturn(Mono.just(fileUrl));

                // When
                FileUploadResponse response = storageService.uploadFile(
                                multipartFile,
                                bucket,
                                folder,
                                FileValidationService.FileCategory.AVATAR);

                // Then
                assertThat(response).isNotNull();
                assertThat(response.getFileUrl()).isEqualTo(fileUrl);
                assertThat(response.getBucket()).isEqualTo(bucket);
                verify(fileValidationService).validateFile(multipartFile, FileValidationService.FileCategory.AVATAR);
        }

        @Test
        @DisplayName("Should upload profile avatar")
        void shouldUploadProfileAvatar() {
                // Given
                String userId = "user-123";
                String fileUrl = "https://storage.example.com/avatars/users/user-123/uuid.jpg";

                when(fileValidationService.getFileExtension("image/jpeg")).thenReturn("jpg");
                when(storageClient.uploadFile(any(), eq("avatars"), anyString(), eq("image/jpeg"), eq(1024L)))
                                .thenReturn(Mono.just(fileUrl));

                // When
                FileUploadResponse response = storageService.uploadProfileAvatar(userId, multipartFile);

                // Then
                assertThat(response).isNotNull();
                assertThat(response.getFileUrl()).isEqualTo(fileUrl);
                verify(fileValidationService).validateFile(multipartFile, FileValidationService.FileCategory.AVATAR);
        }

        @Test
        @DisplayName("Should upload KYC document")
        void shouldUploadKYCDocument() {
                // Given
                String userId = "user-123";
                String documentType = "AADHAAR";
                String fileUrl = "https://storage.example.com/kyc-documents/users/user-123/aadhaar/uuid.jpg";

                when(fileValidationService.getFileExtension("image/jpeg")).thenReturn("jpg");
                when(storageClient.uploadFile(any(), eq("kyc-documents"), anyString(), eq("image/jpeg"), eq(1024L)))
                                .thenReturn(Mono.just(fileUrl));

                // When
                FileUploadResponse response = storageService.uploadKYCDocument(userId, documentType, multipartFile);

                // Then
                assertThat(response).isNotNull();
                assertThat(response.getFileUrl()).isEqualTo(fileUrl);
                verify(fileValidationService).validateFile(multipartFile,
                                FileValidationService.FileCategory.KYC_DOCUMENT);
        }

        @Test
        @DisplayName("Should generate signed URL")
        void shouldGenerateSignedUrl() {
                // Given
                String fileUrl = "https://storage.example.com/storage/v1/object/public/avatars/users/123/file.jpg";
                String signedUrl = "https://storage.example.com/storage/v1/object/sign/avatars/users/123/file.jpg?token=abc123";
                int expiresIn = 3600;

                when(storageClient.generateSignedUrl(eq("avatars"), eq("users/123/file.jpg"), eq(expiresIn)))
                                .thenReturn(Mono.just(signedUrl));

                // When
                SignedUrlResponse response = storageService.generateSignedUrl(fileUrl, expiresIn);

                // Then
                assertThat(response).isNotNull();
                assertThat(response.getSignedUrl()).isEqualTo(signedUrl);
                assertThat(response.getFileUrl()).isEqualTo(fileUrl);
        }

        @Test
        @DisplayName("Should delete file")
        void shouldDeleteFile() {
                // Given
                String fileUrl = "https://storage.example.com/storage/v1/object/public/avatars/users/123/file.jpg";

                when(storageClient.deleteFile(eq("avatars"), eq("users/123/file.jpg")))
                                .thenReturn(Mono.empty());

                // When
                storageService.deleteFile(fileUrl);

                // Then
                verify(storageClient).deleteFile(eq("avatars"), eq("users/123/file.jpg"));
        }

        @Test
        @DisplayName("Should throw exception on invalid file URL")
        void shouldThrowExceptionOnInvalidFileUrl() {
                // Given
                String invalidUrl = "invalid-url";

                // When/Then
                assertThatThrownBy(() -> storageService.deleteFile(invalidUrl))
                                .isInstanceOf(BusinessException.class)
                                .hasMessageContaining("Invalid file URL format");
        }

        @Test
        @DisplayName("Should handle upload failure")
        void shouldHandleUploadFailure() {
                // Given
                when(fileValidationService.getFileExtension("image/jpeg")).thenReturn("jpg");
                when(storageClient.uploadFile(any(), anyString(), anyString(), anyString(), anyLong()))
                                .thenReturn(Mono.error(new IOException("Upload failed")));

                // When/Then
                assertThatThrownBy(() -> storageService.uploadFile(
                                multipartFile,
                                "avatars",
                                "users/123",
                                FileValidationService.FileCategory.AVATAR)).isInstanceOf(BusinessException.class)
                                .hasMessageContaining("Failed to upload file");
        }
}
