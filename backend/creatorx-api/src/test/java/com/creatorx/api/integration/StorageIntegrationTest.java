package com.creatorx.api.integration;

import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Storage API
 * Note: These tests mock Supabase Storage calls
 */
@DisplayName("Storage Integration Tests")
class StorageIntegrationTest extends BaseIntegrationTest {
    
    @Autowired
    protected MockMvc mockMvc;
    
    @Autowired
    protected UserRepository userRepository;
    
    private User user;
    
    @BeforeEach
    void setUp() {
        // Clean up
        userRepository.deleteAll();
        
        // Create test user
        user = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@test.com")
                .build();
        user = userRepository.save(user);
    }
    
    @Test
    @DisplayName("Should upload avatar")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldUploadAvatar() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake image content".getBytes()
        );
        
        mockMvc.perform(multipart("/api/v1/storage/upload/avatar")
                        .file(file)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileUrl").exists())
                .andExpect(jsonPath("$.bucket").value("avatars"));
    }
    
    @Test
    @DisplayName("Should upload KYC document")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldUploadKYCDocument() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "aadhaar.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake image content".getBytes()
        );
        
        mockMvc.perform(multipart("/api/v1/storage/upload/kyc")
                        .file(file)
                        .param("documentType", "AADHAAR")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileUrl").exists())
                .andExpect(jsonPath("$.bucket").value("kyc-documents"));
    }
    
    @Test
    @DisplayName("Should reject invalid file type")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldRejectInvalidFileType() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "document.exe",
                "application/x-msdownload",
                "fake executable content".getBytes()
        );
        
        mockMvc.perform(multipart("/api/v1/storage/upload/avatar")
                        .file(file)
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    @DisplayName("Should reject file that is too large")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldRejectFileTooLarge() throws Exception {
        // Create a file larger than 5MB
        byte[] largeContent = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                largeContent
        );
        
        mockMvc.perform(multipart("/api/v1/storage/upload/avatar")
                        .file(file)
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    @DisplayName("Should generate signed URL")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldGenerateSignedUrl() throws Exception {
        String fileUrl = "https://storage.example.com/storage/v1/object/public/avatars/users/123/file.jpg";
        
        mockMvc.perform(get("/api/v1/storage/signed-url")
                        .param("fileUrl", fileUrl)
                        .param("expiresIn", "3600")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signedUrl").exists())
                .andExpect(jsonPath("$.expiresAt").exists());
    }
}

