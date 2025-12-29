package com.creatorx.api.integration;

import com.creatorx.common.enums.UserRole;
import com.creatorx.repository.BrandProfileRepository;
import com.creatorx.repository.CreatorProfileRepository;
import com.creatorx.repository.UserProfileRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BrandProfile;
import com.creatorx.repository.entity.CreatorProfile;
import com.creatorx.repository.entity.User;
import com.creatorx.repository.entity.UserProfile;
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
 * Integration tests for Profile API
 * Uses TestContainers for real PostgreSQL database
 */
@DisplayName("Profile Integration Tests")
class ProfileIntegrationTest extends BaseIntegrationTest {
    
    @Autowired
    protected MockMvc mockMvc;
    
    @Autowired
    protected UserRepository userRepository;
    
    @Autowired
    protected UserProfileRepository userProfileRepository;
    
    @Autowired
    protected CreatorProfileRepository creatorProfileRepository;
    
    @Autowired
    protected BrandProfileRepository brandProfileRepository;
    
    private User creator;
    private User brand;
    
    @BeforeEach
    void setUp() {
        // Clean up
        brandProfileRepository.deleteAll();
        creatorProfileRepository.deleteAll();
        userProfileRepository.deleteAll();
        userRepository.deleteAll();
        
        // Create creator user
        creator = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@test.com")
                .build();
        creator = userRepository.save(creator);
        
        // Create creator profile
        CreatorProfile creatorProfile = CreatorProfile.builder()
                .user(creator)
                .username("creator123")
                .category("FASHION")
                .followerCount(1000)
                .build();
        creatorProfileRepository.save(creatorProfile);
        
        // Create brand user
        brand = TestDataBuilder.user()
                .asBrand()
                .withEmail("brand@test.com")
                .build();
        brand = userRepository.save(brand);
        
        // Create brand profile
        BrandProfile brandProfile = BrandProfile.builder()
                .user(brand)
                .companyName("Test Brand")
                .industry("Fashion")
                .build();
        brandProfileRepository.save(brandProfile);
    }
    
    @Test
    @DisplayName("Should get user profile")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldGetUserProfile() throws Exception {
        // Create user profile
        UserProfile profile = UserProfile.builder()
                .user(creator)
                .fullName("Creator Name")
                .bio("Creator bio")
                .build();
        userProfileRepository.save(profile);
        
        mockMvc.perform(get("/api/v1/profile")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Creator Name"))
                .andExpect(jsonPath("$.email").value("creator@test.com"));
    }
    
    @Test
    @DisplayName("Should update user profile")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldUpdateUserProfile() throws Exception {
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
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldUploadAvatar() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake image content".getBytes()
        );
        
        mockMvc.perform(multipart("/api/v1/profile/avatar")
                        .file(file)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isNotEmpty());
    }
    
    @Test
    @DisplayName("Should get creator profile")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldGetCreatorProfile() throws Exception {
        mockMvc.perform(get("/api/v1/profile/creator")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("creator123"))
                .andExpect(jsonPath("$.category").value("FASHION"));
    }
    
    @Test
    @DisplayName("Should update creator profile")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldUpdateCreatorProfile() throws Exception {
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
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldAddPortfolioItem() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "media",
                "portfolio.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "fake image content".getBytes()
        );
        
        mockMvc.perform(multipart("/api/v1/profile/portfolio")
                        .file(file)
                        .param("title", "Test Portfolio Item")
                        .param("description", "Test description")
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Portfolio Item"))
                .andExpect(jsonPath("$.mediaUrl").exists());
    }
    
    @Test
    @DisplayName("Should get portfolio items")
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldGetPortfolioItems() throws Exception {
        mockMvc.perform(get("/api/v1/profile/portfolio")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
    
    @Test
    @DisplayName("Should get brand profile")
    @WithMockUser(username = "brand@test.com", roles = "BRAND")
    void shouldGetBrandProfile() throws Exception {
        mockMvc.perform(get("/api/v1/profile/brand")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Test Brand"))
                .andExpect(jsonPath("$.industry").value("Fashion"));
    }
    
    @Test
    @DisplayName("Should update brand profile")
    @WithMockUser(username = "brand@test.com", roles = "BRAND")
    void shouldUpdateBrandProfile() throws Exception {
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
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldRejectInvalidUsername() throws Exception {
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
    @WithMockUser(username = "creator@test.com", roles = "CREATOR")
    void shouldRejectInvalidInstagramUrl() throws Exception {
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

