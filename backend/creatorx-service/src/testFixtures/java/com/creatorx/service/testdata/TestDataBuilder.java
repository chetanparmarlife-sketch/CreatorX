package com.creatorx.service.testdata;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.enums.UserStatus;
import com.creatorx.repository.entity.Application;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Test data builders for creating test entities
 * Uses builder pattern for flexible test data creation
 */
public class TestDataBuilder {
    
    public static UserBuilder user() {
        return new UserBuilder();
    }
    
    public static CampaignBuilder campaign() {
        return new CampaignBuilder();
    }
    
    public static ApplicationBuilder application() {
        return new ApplicationBuilder();
    }
    
    public static class UserBuilder {
        private String id = UUID.randomUUID().toString();
        private String email = "test@example.com";
        private String phone = "+919876543210";
        private String supabaseId = "supabase-" + UUID.randomUUID().toString();
        private String passwordHash = "hashed_password";
        private UserRole role = UserRole.CREATOR;
        private UserStatus status = UserStatus.ACTIVE;
        private Boolean emailVerified = true;
        private Boolean phoneVerified = false;
        
        public UserBuilder withId(String id) {
            this.id = id;
            return this;
        }
        
        public UserBuilder withEmail(String email) {
            this.email = email;
            return this;
        }
        
        public UserBuilder withRole(UserRole role) {
            this.role = role;
            return this;
        }
        
        public UserBuilder withStatus(UserStatus status) {
            this.status = status;
            return this;
        }
        
        public UserBuilder asBrand() {
            this.role = UserRole.BRAND;
            return this;
        }
        
        public UserBuilder asCreator() {
            this.role = UserRole.CREATOR;
            return this;
        }
        
        public UserBuilder asAdmin() {
            this.role = UserRole.ADMIN;
            return this;
        }
        
        public UserBuilder inactive() {
            this.status = UserStatus.INACTIVE;
            return this;
        }
        
        public User build() {
            return User.builder()
                    .id(id)
                    .email(email)
                    .phone(phone)
                    .supabaseId(supabaseId)
                    .passwordHash(passwordHash)
                    .role(role)
                    .status(status)
                    .emailVerified(emailVerified)
                    .phoneVerified(phoneVerified)
                    .build();
        }
    }
    
    public static class CampaignBuilder {
        private String id = UUID.randomUUID().toString();
        private User brand = TestDataBuilder.user().asBrand().build();
        private String title = "Test Campaign";
        private String description = "Test campaign description";
        private BigDecimal budget = new BigDecimal("10000.00");
        private CampaignPlatform platform = CampaignPlatform.INSTAGRAM;
        private String category = "Fashion";
        private String requirements = "Test requirements";
        private CampaignStatus status = CampaignStatus.DRAFT;
        private LocalDate startDate = LocalDate.now().plusDays(1);
        private LocalDate endDate = LocalDate.now().plusDays(30);
        private LocalDate applicationDeadline = LocalDate.now().plusDays(7);
        private Integer maxApplicants = 10;
        private Integer selectedCreatorsCount = 0;
        
        public CampaignBuilder withId(String id) {
            this.id = id;
            return this;
        }
        
        public CampaignBuilder withBrand(User brand) {
            this.brand = brand;
            return this;
        }
        
        public CampaignBuilder withTitle(String title) {
            this.title = title;
            return this;
        }
        
        public CampaignBuilder withBudget(BigDecimal budget) {
            this.budget = budget;
            return this;
        }
        
        public CampaignBuilder withPlatform(CampaignPlatform platform) {
            this.platform = platform;
            return this;
        }
        
        public CampaignBuilder withStatus(CampaignStatus status) {
            this.status = status;
            return this;
        }
        
        public CampaignBuilder active() {
            this.status = CampaignStatus.ACTIVE;
            return this;
        }
        
        public CampaignBuilder completed() {
            this.status = CampaignStatus.COMPLETED;
            return this;
        }
        
        public CampaignBuilder withDates(LocalDate startDate, LocalDate endDate) {
            this.startDate = startDate;
            this.endDate = endDate;
            return this;
        }
        
        public CampaignBuilder withApplicationDeadline(LocalDate applicationDeadline) {
            this.applicationDeadline = applicationDeadline;
            return this;
        }
        
        public Campaign build() {
            return Campaign.builder()
                    .id(id)
                    .brand(brand)
                    .title(title)
                    .description(description)
                    .budget(budget)
                    .platform(platform)
                    .category(category)
                    .requirements(requirements)
                    .status(status)
                    .startDate(startDate)
                    .endDate(endDate)
                    .applicationDeadline(applicationDeadline)
                    .maxApplicants(maxApplicants)
                    .selectedCreatorsCount(selectedCreatorsCount)
                    .build();
        }
    }
    
    public static class ApplicationBuilder {
        private String id = UUID.randomUUID().toString();
        private Campaign campaign = TestDataBuilder.campaign().build();
        private User creator = TestDataBuilder.user().asCreator().build();
        private ApplicationStatus status = ApplicationStatus.APPLIED;
        private String pitchText = "I am a creative content creator with experience in fashion and lifestyle content.";
        private String expectedTimeline = "2 weeks";
        private LocalDateTime appliedAt = LocalDateTime.now();
        
        public ApplicationBuilder withId(String id) {
            this.id = id;
            return this;
        }
        
        public ApplicationBuilder withCampaign(Campaign campaign) {
            this.campaign = campaign;
            return this;
        }
        
        public ApplicationBuilder withCreator(User creator) {
            this.creator = creator;
            return this;
        }
        
        public ApplicationBuilder withStatus(ApplicationStatus status) {
            this.status = status;
            return this;
        }
        
        public ApplicationBuilder withPitchText(String pitchText) {
            this.pitchText = pitchText;
            return this;
        }
        
        public ApplicationBuilder withExpectedTimeline(String expectedTimeline) {
            this.expectedTimeline = expectedTimeline;
            return this;
        }
        
        public Application build() {
            return Application.builder()
                    .id(id)
                    .campaign(campaign)
                    .creator(creator)
                    .status(status)
                    .pitchText(pitchText)
                    .expectedTimeline(expectedTimeline)
                    .appliedAt(appliedAt)
                    .build();
        }
    }
}

