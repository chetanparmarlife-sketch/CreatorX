package com.creatorx.api.integration;

import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.User;
import com.creatorx.service.storage.SupabaseStorageService;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Base class for integration tests
 * Uses H2 in-memory database locally, PostgreSQL in CI (via environment
 * variables)
 * 
 * For CI: Set TEST_DATABASE_URL, TEST_DATABASE_USERNAME, TEST_DATABASE_PASSWORD
 * For local: Uses H2 in-memory database from application-test.yml
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

        @Autowired
        protected MockMvc mockMvc;

        @Autowired
        protected UserRepository userRepository;

        // Mock external services to prevent real API calls
        @MockBean
        protected SupabaseStorageService supabaseStorageService;

        // Mock FCM service to prevent Firebase initialization
        @MockBean
        protected com.creatorx.service.FCMService fcmService;

        // Mock CacheService to prevent Redis connection requirements
        @MockBean
        protected com.creatorx.service.CacheService cacheService;

        // Mock RedisConnectionFactory to prevent Redis connection attempts
        @MockBean
        protected org.springframework.cache.CacheManager cacheManager;

        // Test users for authentication
        protected User testCreator;
        protected User testBrand;
        protected User testAdmin;

        @BeforeEach
        public void setUpBaseTest() {
                // Configure CacheManager mock to return a no-op cache for any cache name
                org.springframework.cache.concurrent.ConcurrentMapCache noOpCache = new org.springframework.cache.concurrent.ConcurrentMapCache(
                                "test");
                org.mockito.Mockito.when(cacheManager.getCache(org.mockito.ArgumentMatchers.anyString()))
                                .thenReturn(noOpCache);

                // Configure SupabaseStorageService mock to return valid FileUploadResponse
                com.creatorx.service.dto.FileUploadResponse mockUploadResponse = com.creatorx.service.dto.FileUploadResponse
                                .builder()
                                .fileUrl("https://storage.example.com/test/file.jpg")
                                .fileName("file.jpg")
                                .fileType("image/jpeg")
                                .fileSize(1024L)
                                .bucket("test-bucket")
                                .path("test/file.jpg")
                                .build();
                // Mock uploadFile with FileCategory (used by
                // DeliverableService.submitDeliverable)
                org.mockito.Mockito.when(supabaseStorageService.uploadFile(
                                org.mockito.ArgumentMatchers.any(org.springframework.web.multipart.MultipartFile.class),
                                org.mockito.ArgumentMatchers.anyString(),
                                org.mockito.ArgumentMatchers.anyString(),
                                org.mockito.ArgumentMatchers.any(
                                                com.creatorx.service.storage.FileValidationService.FileCategory.class)))
                                .thenReturn(mockUploadResponse);
                // Mock specific upload convenience methods used by other services
                org.mockito.Mockito.when(supabaseStorageService.uploadDeliverable(
                                org.mockito.ArgumentMatchers.anyString(),
                                org.mockito.ArgumentMatchers.any())).thenReturn(mockUploadResponse);
                org.mockito.Mockito.when(supabaseStorageService.uploadProfileAvatar(
                                org.mockito.ArgumentMatchers.anyString(),
                                org.mockito.ArgumentMatchers.any())).thenReturn(mockUploadResponse);
                org.mockito.Mockito.when(supabaseStorageService.uploadKYCDocument(
                                org.mockito.ArgumentMatchers.anyString(),
                                org.mockito.ArgumentMatchers.anyString(),
                                org.mockito.ArgumentMatchers.any())).thenReturn(mockUploadResponse);
                org.mockito.Mockito.when(supabaseStorageService.uploadPortfolioItem(
                                org.mockito.ArgumentMatchers.anyString(),
                                org.mockito.ArgumentMatchers.any())).thenReturn(mockUploadResponse);

                // Create or fetch test users
                testCreator = userRepository.findByEmail("test-creator@example.com")
                                .orElseGet(() -> userRepository.save(
                                                TestDataBuilder.user()
                                                                .asCreator()
                                                                .withEmail("test-creator@example.com")
                                                                .build()));

                testBrand = userRepository.findByEmail("test-brand@example.com")
                                .orElseGet(() -> userRepository.save(
                                                TestDataBuilder.user()
                                                                .asBrand()
                                                                .withEmail("test-brand@example.com")
                                                                .build()));

                testAdmin = userRepository.findByEmail("test-admin@example.com")
                                .orElseGet(() -> userRepository.save(
                                                TestDataBuilder.user()
                                                                .asAdmin()
                                                                .withEmail("test-admin@example.com")
                                                                .build()));
        }

        /**
         * Authenticate as the test creator user
         */
        protected void authenticateAsCreator() {
                authenticateAs(testCreator);
        }

        /**
         * Authenticate as the test brand user
         */
        protected void authenticateAsBrand() {
                authenticateAs(testBrand);
        }

        /**
         * Authenticate as the test admin user
         */
        protected void authenticateAsAdmin() {
                authenticateAs(testAdmin);
        }

        /**
         * Set up authentication context for a specific user.
         * Creates authentication where getName() returns user ID and getPrincipal()
         * returns User object.
         */
        protected void authenticateAs(User user) {
                String role = "ROLE_" + user.getRole().name();
                // Create authentication with User as principal
                // Override getName() to return user ID for API endpoints that use
                // authentication.getName()
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                List.of(new SimpleGrantedAuthority(role))) {
                        @Override
                        public String getName() {
                                return user.getId();
                        }
                };
                SecurityContextHolder.getContext().setAuthentication(auth);
        }

        /**
         * Clear authentication context
         */
        protected void clearAuthentication() {
                SecurityContextHolder.clearContext();
        }
}
