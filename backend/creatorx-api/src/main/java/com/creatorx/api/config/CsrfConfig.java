package com.creatorx.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;

/**
 * CSRF configuration
 * Note: CSRF is disabled for REST API endpoints as they use JWT tokens
 * For web endpoints, CSRF protection can be enabled
 */
@Configuration
public class CsrfConfig {
    
    /**
     * CSRF token repository for web endpoints
     * REST API endpoints use JWT tokens, so CSRF is not needed
     */
    @Bean
    public CsrfTokenRepository csrfTokenRepository() {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookiePath("/");
        return repository;
    }
    
    /**
     * Note: CSRF is disabled in SecurityConfig for REST API
     * This is acceptable because:
     * 1. REST API uses stateless JWT authentication
     * 2. CSRF attacks target stateful sessions
     * 3. CORS is properly configured to restrict origins
     * 
     * If web endpoints are added later, enable CSRF for those specific paths:
     * .csrf(csrf -> csrf
     *     .csrfTokenRepository(csrfTokenRepository())
     *     .ignoringRequestMatchers("/api/**") // REST API doesn't need CSRF
     * )
     */
}

