package com.creatorx.api.integration;

import com.creatorx.common.enums.DocumentStatus;
import com.creatorx.common.enums.DocumentType;
import com.creatorx.repository.KYCDocumentRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.KYCDocument;
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
 * Integration tests for KYC API
 * Uses TestContainers for real PostgreSQL database
 */
@DisplayName("KYC Integration Tests")
class KYCIntegrationTest extends BaseIntegrationTest {
    
    @Autowired
    protected MockMvc mockMvc;
    
    @Autowired
    protected KYCDocumentRepository kycDocumentRepository;
    
    @Autowired
    protected UserRepository userRepository;
    
    private User user;
    private User admin;
    
    @BeforeEach
    void setUp() {
        // Clean up
        kycDocumentRepository.deleteAll();
        userRepository.deleteAll();
        
        // Create test user
        user = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@test.com")
                .build();
        user = userRepository.save(user);
        
        // Create admin user
        admin = TestDataBuilder.user()
                .asAdmin()
                .withEmail("admin@test.com")
                .build();
        admin = userRepository.save(admin);
    }
    
    @Test
    @DisplayName("Should submit KYC document")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldSubmitKYCDocument() throws Exception {
        MockMultipartFile frontImage = new MockMultipartFile(
                "frontImage",
                "aadhaar-front.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake image content".getBytes()
        );
        
        mockMvc.perform(multipart("/api/v1/kyc/submit")
                        .file(frontImage)
                        .param("documentType", "AADHAAR")
                        .param("documentNumber", "123456789012")
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.documentType").value("AADHAAR"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }
    
    @Test
    @DisplayName("Should get KYC status")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldGetKYCStatus() throws Exception {
        // Create a KYC document
        KYCDocument document = KYCDocument.builder()
                .user(user)
                .documentType(DocumentType.AADHAAR)
                .documentNumber("123456789012")
                .documentUrl("https://storage.example.com/kyc/front.jpg")
                .status(DocumentStatus.PENDING)
                .build();
        kycDocumentRepository.save(document);
        
        mockMvc.perform(get("/api/v1/kyc/status")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallStatus").value("PENDING"))
                .andExpect(jsonPath("$.isVerified").value(false))
                .andExpect(jsonPath("$.documents").isArray());
    }
    
    @Test
    @DisplayName("Should get KYC documents")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldGetKYCDocuments() throws Exception {
        // Create KYC documents
        KYCDocument doc1 = KYCDocument.builder()
                .user(user)
                .documentType(DocumentType.AADHAAR)
                .documentNumber("123456789012")
                .documentUrl("https://storage.example.com/kyc/aadhaar.jpg")
                .status(DocumentStatus.PENDING)
                .build();
        
        KYCDocument doc2 = KYCDocument.builder()
                .user(user)
                .documentType(DocumentType.PAN)
                .documentNumber("ABCDE1234F")
                .documentUrl("https://storage.example.com/kyc/pan.jpg")
                .status(DocumentStatus.APPROVED)
                .build();
        
        kycDocumentRepository.saveAll(java.util.Arrays.asList(doc1, doc2));
        
        mockMvc.perform(get("/api/v1/kyc/documents")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].documentType").exists());
    }
    
    @Test
    @DisplayName("Should approve KYC document (Admin)")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void shouldApproveKYCDocument() throws Exception {
        // Create a pending KYC document
        KYCDocument document = KYCDocument.builder()
                .user(user)
                .documentType(DocumentType.AADHAAR)
                .documentNumber("123456789012")
                .documentUrl("https://storage.example.com/kyc/front.jpg")
                .status(DocumentStatus.PENDING)
                .build();
        document = kycDocumentRepository.save(document);
        
        mockMvc.perform(put("/api/v1/kyc/documents/{documentId}/approve", document.getId())
                        .with(csrf()))
                .andExpect(status().isNoContent());
        
        // Verify document is approved
        KYCDocument updated = kycDocumentRepository.findById(document.getId()).orElseThrow();
        assert updated.getStatus() == DocumentStatus.APPROVED;
    }
    
    @Test
    @DisplayName("Should reject KYC document (Admin)")
    @WithMockUser(username = "admin@test.com", roles = "ADMIN")
    void shouldRejectKYCDocument() throws Exception {
        // Create a pending KYC document
        KYCDocument document = KYCDocument.builder()
                .user(user)
                .documentType(DocumentType.AADHAAR)
                .documentNumber("123456789012")
                .documentUrl("https://storage.example.com/kyc/front.jpg")
                .status(DocumentStatus.PENDING)
                .build();
        document = kycDocumentRepository.save(document);
        
        mockMvc.perform(put("/api/v1/kyc/documents/{documentId}/reject", document.getId())
                        .param("reason", "Document is unclear")
                        .with(csrf()))
                .andExpect(status().isNoContent());
        
        // Verify document is rejected
        KYCDocument updated = kycDocumentRepository.findById(document.getId()).orElseThrow();
        assert updated.getStatus() == DocumentStatus.REJECTED;
        assert updated.getRejectionReason().equals("Document is unclear");
    }
    
    @Test
    @DisplayName("Should block non-admin from approving")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldBlockNonAdminFromApproving() throws Exception {
        // Create a pending KYC document
        KYCDocument document = KYCDocument.builder()
                .user(user)
                .documentType(DocumentType.AADHAAR)
                .documentNumber("123456789012")
                .documentUrl("https://storage.example.com/kyc/front.jpg")
                .status(DocumentStatus.PENDING)
                .build();
        document = kycDocumentRepository.save(document);
        
        mockMvc.perform(put("/api/v1/kyc/documents/{documentId}/approve", document.getId())
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}

