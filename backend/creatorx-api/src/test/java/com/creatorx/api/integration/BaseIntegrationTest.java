package com.creatorx.api.integration;

import com.creatorx.common.enums.UserRole;
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
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

/**
 * Base class for integration tests
 * Provides TestContainers PostgreSQL setup and common test infrastructure
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("creatorx_test")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true); // Reuse container across tests
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Autowired
    protected MockMvc mockMvc;
    
    @Autowired
    protected UserRepository userRepository;
    
    // Mock external services to prevent real API calls
    @MockBean
    protected SupabaseStorageService supabaseStorageService;
    
    // Test users for authentication
    protected User testCreator;
    protected User testBrand;
    protected User testAdmin;
    
    @BeforeEach
    void setUpBaseTest() {
        // Create or fetch test users
        testCreator = userRepository.findByEmail("test-creator@example.com")
                .orElseGet(() -> userRepository.save(
                        TestDataBuilder.user()
                                .asCreator()
                                .withEmail("test-creator@example.com")
                                .build()
                ));
        
        testBrand = userRepository.findByEmail("test-brand@example.com")
                .orElseGet(() -> userRepository.save(
                        TestDataBuilder.user()
                                .asBrand()
                                .withEmail("test-brand@example.com")
                                .build()
                ));
        
        testAdmin = userRepository.findByEmail("test-admin@example.com")
                .orElseGet(() -> userRepository.save(
                        TestDataBuilder.user()
                                .asAdmin()
                                .withEmail("test-admin@example.com")
                                .build()
                ));
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
     * Set up authentication context for a specific user
     */
    protected void authenticateAs(User user) {
        String role = "ROLE_" + user.getRole().name();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user.getId(),
                null,
                List.of(new SimpleGrantedAuthority(role))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
    
    /**
     * Clear authentication context
     */
    protected void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }
}


