package com.creatorx.api.integration;

import com.creatorx.common.enums.DocumentStatus;
import com.creatorx.common.enums.DocumentType;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.repository.AdminPermissionRepository;
import com.creatorx.repository.KYCDocumentRepository;
import com.creatorx.repository.entity.AdminPermission;
import com.creatorx.repository.entity.KYCDocument;
import com.creatorx.repository.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockPart;

import java.nio.charset.StandardCharsets;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for KYC API
 * Uses H2 database with BaseIntegrationTest authentication
 */
@DisplayName("KYC Integration Tests")
class KYCIntegrationTest extends BaseIntegrationTest {

        @Autowired
        protected KYCDocumentRepository kycDocumentRepository;

        @Autowired
        protected AdminPermissionRepository adminPermissionRepository;

        private User user;
        private User admin;

        @BeforeEach
        @Override
        public void setUpBaseTest() {
                super.setUpBaseTest();

                // Clean up
                kycDocumentRepository.deleteAll();
                adminPermissionRepository.deleteAll();

                // Use base test users
                user = testCreator;
                admin = testAdmin;

                // Grant admin permission for KYC review
                AdminPermission kycPermission = AdminPermission.builder()
                                .admin(admin)
                                .permission(AdminPermissions.ADMIN_KYC_REVIEW)
                                .build();
                adminPermissionRepository.save(kycPermission);
        }

        @Test
        @DisplayName("Should submit KYC document")
        void shouldSubmitKYCDocument() throws Exception {
                authenticateAs(user);

                MockMultipartFile frontImage = new MockMultipartFile(
                                "frontImage",
                                "aadhaar-front.jpg",
                                MediaType.IMAGE_JPEG_VALUE,
                                "fake image content".getBytes());

                // Use MockPart for @RequestPart parameters
                MockPart documentTypePart = new MockPart("documentType", "AADHAAR".getBytes(StandardCharsets.UTF_8));
                MockPart documentNumberPart = new MockPart("documentNumber",
                                "123456789012".getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/api/v1/kyc/submit")
                                .file(frontImage)
                                .part(documentTypePart)
                                .part(documentNumberPart)
                                .with(csrf()))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.documentType").value("AADHAAR"))
                                .andExpect(jsonPath("$.status").value("PENDING"));
        }

        @Test
        @DisplayName("Should get KYC status")
        void shouldGetKYCStatus() throws Exception {
                authenticateAs(user);

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
                                .andExpect(jsonPath("$.verified").value(false))
                                .andExpect(jsonPath("$.documents").isArray());
        }

        @Test
        @DisplayName("Should get KYC documents")
        void shouldGetKYCDocuments() throws Exception {
                authenticateAs(user);

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
        void shouldApproveKYCDocument() throws Exception {
                authenticateAs(admin);

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
        void shouldRejectKYCDocument() throws Exception {
                authenticateAs(admin);

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
        void shouldBlockNonAdminFromApproving() throws Exception {
                authenticateAs(user); // Creator, not admin

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
