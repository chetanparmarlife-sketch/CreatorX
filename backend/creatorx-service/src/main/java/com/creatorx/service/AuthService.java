/**
 * Authentication service integrating Supabase Auth with Spring Boot
 */

package com.creatorx.service;

import com.creatorx.common.enums.UserRole;
import com.creatorx.common.enums.UserStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.BrandProfileRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BrandProfile;
import com.creatorx.repository.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final BrandProfileRepository brandProfileRepository;
    private final RestTemplate restTemplate;
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.service.role.key:}")
    private String supabaseServiceRoleKey; // For admin operations
    
    /**
     * Register a new user in Supabase and create profile in Spring Boot
     */
    @Transactional
    public User registerUser(String email, String password, UserRole role, String name, String phone) {
        // Check if user already exists
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("User with email " + email + " already exists");
        }
        
        // Register user in Supabase (this should be done from client, but we can create the user here)
        // Note: In production, registration should happen on client side via Supabase SDK
        // This method assumes Supabase user is already created and we're just syncing
        
        // For now, we'll create the user in our DB
        // In real implementation, Supabase webhook or client callback will trigger this
        
        User user = User.builder()
                .email(email)
                .phone(phone)
                .role(role)
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .phoneVerified(false)
                .build();
        
        // Generate a temporary Supabase ID (in production, this comes from Supabase)
        // This will be updated when Supabase webhook confirms user creation
        String tempSupabaseId = "temp_" + UUID.randomUUID().toString();
        user.setSupabaseId(tempSupabaseId);
        
        // Set password hash (in production, password is handled by Supabase)
        // We store a placeholder here
        user.setPasswordHash("supabase_managed");
        
        User savedUser = userRepository.save(user);
        
        log.info("Registered user: {} with role: {}", email, role);
        return savedUser;
    }
    
    /**
     * Link Supabase user to internal user after Supabase registration
     * Called via webhook or after client-side registration
     * For brands, creates brand profile with company information
     */
    @Transactional
    public User linkSupabaseUser(String supabaseUserId, String email, String name, UserRole role, 
                                 String companyName, String industry, String website) {
        // Check if user already exists by email
        User user = userRepository.findByEmail(email)
                .orElse(null);
        
        if (user == null) {
            // Create new user
            user = User.builder()
                    .email(email)
                    .supabaseId(supabaseUserId)
                    .role(role)
                    .status(UserStatus.ACTIVE)
                    .emailVerified(false)
                    .phoneVerified(false)
                    .passwordHash("supabase_managed")
                    .build();
            user = userRepository.save(user);
        } else {
            // Update existing user with Supabase ID
            user.setSupabaseId(supabaseUserId);
            user = userRepository.save(user);
        }
        
        // Create role-specific profile if it doesn't exist
        createRoleProfile(user, name, companyName, industry, website);
        
        return user;
    }
    
    /**
     * Create role-specific profile (Brand or Creator)
     */
    private void createRoleProfile(User user, String name, String companyName, String industry, String website) {
        if (user.getRole() == UserRole.BRAND) {
            // Check if brand profile already exists
            if (!brandProfileRepository.existsById(user.getId())) {
                BrandProfile brandProfile = BrandProfile.builder()
                        .user(user)
                        .companyName(companyName != null ? companyName : (name != null ? name : user.getEmail().split("@")[0]))
                        .industry(industry)
                        .website(website)
                        .verified(false)
                        .build();
                brandProfileRepository.save(brandProfile);
                log.info("Created brand profile for user: {} with company: {}", user.getId(), brandProfile.getCompanyName());
            } else {
                // Update existing profile if company info provided
                BrandProfile existingProfile = brandProfileRepository.findById(user.getId()).orElse(null);
                if (existingProfile != null && companyName != null) {
                    boolean updated = false;
                    if (companyName != null && !companyName.equals(existingProfile.getCompanyName())) {
                        existingProfile.setCompanyName(companyName);
                        updated = true;
                    }
                    if (industry != null && !industry.equals(existingProfile.getIndustry())) {
                        existingProfile.setIndustry(industry);
                        updated = true;
                    }
                    if (website != null && !website.equals(existingProfile.getWebsite())) {
                        existingProfile.setWebsite(website);
                        updated = true;
                    }
                    if (updated) {
                        brandProfileRepository.save(existingProfile);
                        log.info("Updated brand profile for user: {}", user.getId());
                    }
                }
            }
        } else if (user.getRole() == UserRole.CREATOR) {
            // Creator profile creation is handled separately during onboarding
            // We don't create it here as it requires additional fields (username, category)
        }
    }
    
    /**
     * Get user by Supabase ID
     */
    public User getUserBySupabaseId(String supabaseUserId) {
        return userRepository.findBySupabaseId(supabaseUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "supabaseId: " + supabaseUserId));
    }
    
    /**
     * Update user email verification status
     */
    @Transactional
    public void updateEmailVerification(String supabaseUserId, boolean verified) {
        User user = getUserBySupabaseId(supabaseUserId);
        user.setEmailVerified(verified);
        userRepository.save(user);
    }
    
    /**
     * Update user phone verification status
     */
    @Transactional
    public void updatePhoneVerification(String supabaseUserId, boolean verified) {
        User user = getUserBySupabaseId(supabaseUserId);
        user.setPhoneVerified(verified);
        userRepository.save(user);
    }
    
    /**
     * Update last login timestamp
     */
    @Transactional
    public void updateLastLogin(String supabaseUserId) {
        User user = getUserBySupabaseId(supabaseUserId);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    /**
     * Check if user exists by email
     */
    public boolean userExists(String email) {
        return userRepository.existsByEmail(email);
    }
    
    /**
     * Get user profile for authenticated user
     */
    public User getUserProfile(String supabaseUserId) {
        return getUserBySupabaseId(supabaseUserId);
    }
}
