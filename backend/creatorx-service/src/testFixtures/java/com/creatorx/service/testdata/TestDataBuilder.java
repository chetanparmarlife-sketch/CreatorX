package com.creatorx.service.testdata;

import com.creatorx.common.enums.ApplicationStatus;
import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.DeliverableStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.enums.UserStatus;
import com.creatorx.repository.entity.Application;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.Deliverable;
import com.creatorx.repository.entity.User;
import com.creatorx.repository.entity.Wallet;

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
    
    public static WalletBuilder wallet() {
        return new WalletBuilder();
    }
    
    public static DeliverableBuilder deliverable() {
        return new DeliverableBuilder();
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
    
    public static class WalletBuilder {
        private String id = UUID.randomUUID().toString();
        private User user = TestDataBuilder.user().asCreator().build();
        private BigDecimal balance = new BigDecimal("1000.00");
        private BigDecimal pendingBalance = new BigDecimal("500.00");
        private BigDecimal totalEarned = new BigDecimal("2000.00");
        private BigDecimal totalWithdrawn = new BigDecimal("1000.00");
        
        public WalletBuilder withId(String id) {
            this.id = id;
            return this;
        }
        
        public WalletBuilder withUser(User user) {
            this.user = user;
            return this;
        }
        
        public WalletBuilder withBalance(BigDecimal balance) {
            this.balance = balance;
            return this;
        }
        
        public WalletBuilder withPendingBalance(BigDecimal pendingBalance) {
            this.pendingBalance = pendingBalance;
            return this;
        }
        
        public WalletBuilder withTotalEarned(BigDecimal totalEarned) {
            this.totalEarned = totalEarned;
            return this;
        }
        
        public WalletBuilder withTotalWithdrawn(BigDecimal totalWithdrawn) {
            this.totalWithdrawn = totalWithdrawn;
            return this;
        }
        
        public WalletBuilder empty() {
            this.balance = BigDecimal.ZERO;
            this.pendingBalance = BigDecimal.ZERO;
            this.totalEarned = BigDecimal.ZERO;
            this.totalWithdrawn = BigDecimal.ZERO;
            return this;
        }
        
        public Wallet build() {
            return Wallet.builder()
                    .id(id)
                    .user(user)
                    .balance(balance)
                    .pendingBalance(pendingBalance)
                    .totalEarned(totalEarned)
                    .totalWithdrawn(totalWithdrawn)
                    .build();
        }
    }
    
    public static class DeliverableBuilder {
        private String id = UUID.randomUUID().toString();
        private Application application = TestDataBuilder.application().build();
        private String title = "Test Deliverable";
        private String description = "Test deliverable description";
        private DeliverableStatus status = DeliverableStatus.PENDING;
        private LocalDate dueDate = LocalDate.now().plusDays(14);
        private String mediaUrl;
        private String feedback;
        
        public DeliverableBuilder withId(String id) {
            this.id = id;
            return this;
        }
        
        public DeliverableBuilder withApplication(Application application) {
            this.application = application;
            return this;
        }
        
        public DeliverableBuilder withTitle(String title) {
            this.title = title;
            return this;
        }
        
        public DeliverableBuilder withDescription(String description) {
            this.description = description;
            return this;
        }
        
        public DeliverableBuilder withStatus(DeliverableStatus status) {
            this.status = status;
            return this;
        }
        
        public DeliverableBuilder withDueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
            return this;
        }
        
        public DeliverableBuilder submitted(String mediaUrl) {
            this.status = DeliverableStatus.SUBMITTED;
            this.mediaUrl = mediaUrl;
            return this;
        }
        
        public DeliverableBuilder approved() {
            this.status = DeliverableStatus.APPROVED;
            return this;
        }
        
        public DeliverableBuilder rejected(String feedback) {
            this.status = DeliverableStatus.REVISION_REQUESTED;
            this.feedback = feedback;
            return this;
        }
        
        public Deliverable build() {
            return Deliverable.builder()
                    .id(id)
                    .application(application)
                    .title(title)
                    .description(description)
                    .status(status)
                    .dueDate(dueDate)
                    .mediaUrl(mediaUrl)
                    .feedback(feedback)
                    .build();
        }
    }
}


