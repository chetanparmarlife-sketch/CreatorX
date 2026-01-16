package com.creatorx.api.integration;

import com.creatorx.repository.BrandProfileRepository;
import com.creatorx.repository.CreatorProfileRepository;
import com.creatorx.repository.UserProfileRepository;
import com.creatorx.repository.entity.BrandProfile;
import com.creatorx.repository.entity.CreatorProfile;
import com.creatorx.repository.entity.User;
import com.creatorx.repository.entity.UserProfile;
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
 * Integration tests for Profile API
 * Uses H2 database with BaseIntegrationTest authentication
 */
@DisplayName("Profile Integration Tests")
class ProfileIntegrationTest extends BaseIntegrationTest {

        @Autowired
        protected UserProfileRepository userProfileRepository;

        @Autowired
        protected CreatorProfileRepository creatorProfileRepository;

        @Autowired
        protected BrandProfileRepository brandProfileRepository;

        private User creator;
        private User brand;

        @BeforeEach
        @Override
        public void setUpBaseTest() {
                super.setUpBaseTest();

                // Clean up profiles first (order matters for foreign keys)
                brandProfileRepository.deleteAll();
                creatorProfileRepository.deleteAll();
                userProfileRepository.deleteAll();

                // Use base test users
                creator = testCreator;
                brand = testBrand;

                // Create and link creator profile (bidirectional relationship)
                CreatorProfile creatorProfile = CreatorProfile.builder()
                                .user(creator)
                                .username("creator123")
                                .category("FASHION")
                                .followerCount(1000)
                                .build();
                creatorProfile = creatorProfileRepository.save(creatorProfile);
                creator.setCreatorProfile(creatorProfile);
                userRepository.save(creator);

                // Create and link brand profile (bidirectional relationship)
                BrandProfile brandProfile = BrandProfile.builder()
                                .user(brand)
                                .companyName("Test Brand")
                                .industry("Fashion")
                                .build();
                brandProfile = brandProfileRepository.save(brandProfile);
                brand.setBrandProfile(brandProfile);
                userRepository.save(brand);

                // Create and link user profile for creator (bidirectional relationship)
                UserProfile userProfile = UserProfile.builder()
                                .user(creator)
                                .fullName("Test Creator")
                                .bio("Test bio")
                                .build();
                userProfile = userProfileRepository.save(userProfile);
                creator.setUserProfile(userProfile);
                userRepository.save(creator);
        }

        @Test
        @DisplayName("Should get user profile")
        void shouldGetUserProfile() throws Exception {
                authenticateAs(creator);

                mockMvc.perform(get("/api/v1/profile")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.fullName").value("Test Creator"));
        }

        @Test
        @DisplayName("Should update user profile")
        void shouldUpdateUserProfile() throws Exception {
                authenticateAs(creator);

                String updateRequest = """
                                {
                                    "fullName": "Updated Name",
                                    "bio": "Updated bio"
                                }
                                """;

                mockMvc.perform(put("/api/v1/profile")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequest)
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.fullName").value("Updated Name"));
        }

        @Test
        @DisplayName("Should upload avatar")
        void shouldUploadAvatar() throws Exception {
                authenticateAs(creator);

                MockMultipartFile file = new MockMultipartFile(
                                "file",
                                "avatar.jpg",
                                MediaType.IMAGE_JPEG_VALUE,
                                "fake image content".getBytes());

                mockMvc.perform(multipart("/api/v1/profile/avatar")
                                .file(file)
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isNotEmpty());
        }

        @Test
        @DisplayName("Should get creator profile")
        void shouldGetCreatorProfile() throws Exception {
                authenticateAs(creator);

                mockMvc.perform(get("/api/v1/profile/creator")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.username").value("creator123"))
                                .andExpect(jsonPath("$.category").value("FASHION"));
        }

        @Test
        @DisplayName("Should update creator profile")
        void shouldUpdateCreatorProfile() throws Exception {
                authenticateAs(creator);

                String updateRequest = """
                                {
                                    "username": "newcreator",
                                    "category": "BEAUTY",
                                    "instagramUrl": "https://instagram.com/newcreator"
                                }
                                """;

                mockMvc.perform(put("/api/v1/profile/creator")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequest)
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.username").value("newcreator"))
                                .andExpect(jsonPath("$.category").value("BEAUTY"));
        }

        @Test
        @DisplayName("Should add portfolio item")
        void shouldAddPortfolioItem() throws Exception {
                authenticateAs(creator);

                MockMultipartFile mediaFile = new MockMultipartFile(
                                "media",
                                "portfolio.jpg",
                                MediaType.IMAGE_JPEG_VALUE,
                                "fake image content".getBytes());

                // Use MockPart for @RequestPart parameters
                MockPart titlePart = new MockPart("title", "Test Portfolio Item".getBytes(StandardCharsets.UTF_8));
                MockPart descriptionPart = new MockPart("description",
                                "Test description".getBytes(StandardCharsets.UTF_8));

                mockMvc.perform(multipart("/api/v1/profile/portfolio")
                                .file(mediaFile)
                                .part(titlePart)
                                .part(descriptionPart)
                                .with(csrf()))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.title").value("Test Portfolio Item"))
                                .andExpect(jsonPath("$.mediaUrl").exists());
        }

        @Test
        @DisplayName("Should get portfolio items")
        void shouldGetPortfolioItems() throws Exception {
                authenticateAs(creator);

                mockMvc.perform(get("/api/v1/profile/portfolio")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray());
        }

        @Test
        @DisplayName("Should get brand profile")
        void shouldGetBrandProfile() throws Exception {
                authenticateAs(brand);

                mockMvc.perform(get("/api/v1/profile/brand")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.companyName").value("Test Brand"))
                                .andExpect(jsonPath("$.industry").value("Fashion"));
        }

        @Test
        @DisplayName("Should update brand profile")
        void shouldUpdateBrandProfile() throws Exception {
                authenticateAs(brand);

                String updateRequest = """
                                {
                                    "companyName": "Updated Brand",
                                    "industry": "Tech",
                                    "website": "https://example.com"
                                }
                                """;

                mockMvc.perform(put("/api/v1/profile/brand")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequest)
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.companyName").value("Updated Brand"))
                                .andExpect(jsonPath("$.industry").value("Tech"));
        }

        @Test
        @DisplayName("Should reject invalid username")
        void shouldRejectInvalidUsername() throws Exception {
                authenticateAs(creator);

                String updateRequest = """
                                {
                                    "username": "ab"
                                }
                                """;

                mockMvc.perform(put("/api/v1/profile/creator")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequest)
                                .with(csrf()))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject invalid Instagram URL")
        void shouldRejectInvalidInstagramUrl() throws Exception {
                authenticateAs(creator);

                String updateRequest = """
                                {
                                    "instagramUrl": "invalid-url"
                                }
                                """;

                mockMvc.perform(put("/api/v1/profile/creator")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(updateRequest)
                                .with(csrf()))
                                .andExpect(status().isBadRequest());
        }
}
