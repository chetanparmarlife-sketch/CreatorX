package com.creatorx.api.integration;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.CampaignDeliverableRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.DeliverableRepository;
import com.creatorx.repository.entity.Application;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.CampaignDeliverable;
import com.creatorx.repository.entity.DeliverableSubmission;
import com.creatorx.repository.entity.User;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Deliverable API
 * Uses H2 database with BaseIntegrationTest authentication
 */
@DisplayName("Deliverable Integration Tests")
class DeliverableIntegrationTest extends BaseIntegrationTest {

        @Autowired
        protected DeliverableRepository deliverableRepository;

        @Autowired
        protected ApplicationRepository applicationRepository;

        @Autowired
        protected CampaignDeliverableRepository campaignDeliverableRepository;

        @Autowired
        protected CampaignRepository campaignRepository;

        private User creatorUser;
        private User brandUser;
        private Campaign campaign;
        private Application application;
        private CampaignDeliverable campaignDeliverable;

        @BeforeEach
        @Override
        public void setUpBaseTest() {
                super.setUpBaseTest();

                // Clean up
                deliverableRepository.deleteAll();
                applicationRepository.deleteAll();
                campaignDeliverableRepository.deleteAll();

                // Use base test users
                creatorUser = testCreator;
                brandUser = testBrand;

                // Create test campaign
                campaign = TestDataBuilder.campaign()
                                .withBrand(brandUser)
                                .active()
                                .build();
                campaign = campaignRepository.save(campaign);

                // Create campaign deliverable
                campaignDeliverable = CampaignDeliverable.builder()
                                .campaign(campaign)
                                .title("Instagram Post")
                                .description("Create an Instagram post")
                                .type(CampaignDeliverable.DeliverableType.POST)
                                .dueDate(LocalDate.now().plusDays(14))
                                .isMandatory(true)
                                .orderIndex(1)
                                .build();
                campaignDeliverable = campaignDeliverableRepository.save(campaignDeliverable);

                // Create test application (SELECTED status for deliverable submission)
                application = TestDataBuilder.application()
                                .withCreator(creatorUser)
                                .withCampaign(campaign)
                                .withStatus(ApplicationStatus.SELECTED)
                                .build();
                application = applicationRepository.save(application);
        }

        @Test
        @DisplayName("Should get creator's deliverables")
        void shouldGetCreatorDeliverables() throws Exception {
                authenticateAs(creatorUser);

                // Create a deliverable submission
                DeliverableSubmission submission = DeliverableSubmission.builder()
                                .application(application)
                                .campaignDeliverable(campaignDeliverable)
                                .fileUrl("https://storage.example.com/file.jpg")
                                .description("Test deliverable")
                                .status(SubmissionStatus.PENDING)
                                .build();
                deliverableRepository.save(submission);

                mockMvc.perform(get("/api/v1/deliverables")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("Should submit deliverable with file")
        void shouldSubmitDeliverableWithFile() throws Exception {
                authenticateAs(creatorUser);

                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "test.jpg",
                                MediaType.IMAGE_JPEG_VALUE,
                                "test image content".getBytes());

                mockMvc.perform(multipart("/api/v1/deliverables")
                                .file(file)
                                .param("applicationId", application.getId())
                                .param("campaignDeliverableId", campaignDeliverable.getId())
                                .param("description", "This is a test deliverable submission")
                                .with(csrf()))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.status").value("PENDING"));
        }

        @Test
        @DisplayName("Should fail when submitting without file")
        void shouldFailWhenSubmittingWithoutFile() throws Exception {
                authenticateAs(creatorUser);

                mockMvc.perform(multipart("/api/v1/deliverables")
                                .param("applicationId", application.getId())
                                .param("campaignDeliverableId", campaignDeliverable.getId())
                                .param("description", "This is a test deliverable submission")
                                .with(csrf()))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail when submitting for non-SELECTED application")
        void shouldFailWhenSubmittingForNonSelectedApplication() throws Exception {
                authenticateAs(creatorUser);

                // Create application with APPLIED status
                Application appliedApplication = TestDataBuilder.application()
                                .withCreator(creatorUser)
                                .withCampaign(campaign)
                                .withStatus(ApplicationStatus.APPLIED)
                                .build();
                appliedApplication = applicationRepository.save(appliedApplication);

                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "test.jpg",
                                MediaType.IMAGE_JPEG_VALUE,
                                "test image content".getBytes());

                mockMvc.perform(multipart("/api/v1/deliverables")
                                .file(file)
                                .param("applicationId", appliedApplication.getId())
                                .param("campaignDeliverableId", campaignDeliverable.getId())
                                .param("description", "This is a test deliverable submission")
                                .with(csrf()))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should resubmit deliverable after revision request")
        void shouldResubmitDeliverableAfterRevisionRequest() throws Exception {
                authenticateAs(creatorUser);

                // Create submission with REVISION_REQUESTED status
                DeliverableSubmission submission = DeliverableSubmission.builder()
                                .application(application)
                                .campaignDeliverable(campaignDeliverable)
                                .fileUrl("https://storage.example.com/old-file.jpg")
                                .description("Old description")
                                .status(SubmissionStatus.REVISION_REQUESTED)
                                .build();
                submission = deliverableRepository.save(submission);

                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "new-test.jpg",
                                MediaType.IMAGE_JPEG_VALUE,
                                "new test image content".getBytes());

                mockMvc.perform(multipart("/api/v1/deliverables/{id}", submission.getId())
                                .file(file)
                                .param("description", "Updated description after revision")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(submission.getId()))
                                .andExpect(jsonPath("$.status").value("PENDING"));
        }

        @Test
        @DisplayName("Should get deliverable history")
        void shouldGetDeliverableHistory() throws Exception {
                authenticateAs(creatorUser);

                // Create submission
                DeliverableSubmission submission = DeliverableSubmission.builder()
                                .application(application)
                                .campaignDeliverable(campaignDeliverable)
                                .fileUrl("https://storage.example.com/file.jpg")
                                .description("Test deliverable")
                                .status(SubmissionStatus.PENDING)
                                .build();
                submission = deliverableRepository.save(submission);

                mockMvc.perform(get("/api/v1/deliverables/{id}/history", submission.getId())
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("Should review deliverable (Brand)")
        void shouldReviewDeliverable() throws Exception {
                authenticateAs(brandUser);

                // Create submission
                DeliverableSubmission submission = DeliverableSubmission.builder()
                                .application(application)
                                .campaignDeliverable(campaignDeliverable)
                                .fileUrl("https://storage.example.com/file.jpg")
                                .description("Test deliverable")
                                .status(SubmissionStatus.PENDING)
                                .build();
                submission = deliverableRepository.save(submission);

                String reviewRequest = """
                                {
                                    "status": "APPROVED",
                                    "feedback": "Great work! Approved."
                                }
                                """;

                mockMvc.perform(post("/api/v1/deliverables/{id}/review", submission.getId())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(reviewRequest)
                                .with(csrf()))
                                .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("Should fail when creator tries to review deliverable")
        void shouldFailWhenCreatorTriesToReview() throws Exception {
                authenticateAs(creatorUser);

                // Create submission
                DeliverableSubmission submission = DeliverableSubmission.builder()
                                .application(application)
                                .campaignDeliverable(campaignDeliverable)
                                .fileUrl("https://storage.example.com/file.jpg")
                                .description("Test deliverable")
                                .status(SubmissionStatus.PENDING)
                                .build();
                submission = deliverableRepository.save(submission);

                String reviewRequest = """
                                {
                                    "status": "APPROVED",
                                    "feedback": "Great work!"
                                }
                                """;

                mockMvc.perform(post("/api/v1/deliverables/{id}/review", submission.getId())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(reviewRequest)
                                .with(csrf()))
                                .andExpect(status().isForbidden());
        }
}
