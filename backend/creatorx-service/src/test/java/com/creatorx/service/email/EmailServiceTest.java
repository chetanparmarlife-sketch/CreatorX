package com.creatorx.service.email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for EmailService implementations
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService Tests")
class EmailServiceTest {
    
    private NoOpEmailService noOpEmailService;
    
    @BeforeEach
    void setUp() {
        noOpEmailService = new NoOpEmailService();
    }
    
    @Test
    @DisplayName("NoOpEmailService should report as disabled")
    void noOpEmailService_shouldReportDisabled() {
        assertThat(noOpEmailService.isEnabled()).isFalse();
    }
    
    @Test
    @DisplayName("NoOpEmailService should not throw when sending email")
    void noOpEmailService_shouldNotThrowWhenSendingEmail() {
        // Should complete without exception
        noOpEmailService.sendEmail("test@example.com", "Test Subject", "Test Body");
    }
    
    @Test
    @DisplayName("NoOpEmailService should not throw when sending templated email")
    void noOpEmailService_shouldNotThrowWhenSendingTemplatedEmail() {
        // Should complete without exception
        noOpEmailService.sendTemplatedEmail(
            "test@example.com", 
            "template-123", 
            Map.of("name", "Test User", "amount", "$100")
        );
    }
    
    @Test
    @DisplayName("NoOpEmailService should handle business email methods")
    void noOpEmailService_shouldHandleBusinessEmailMethods() {
        // All business email methods should complete without exception
        noOpEmailService.sendWithdrawalRequestedEmail(
            "creator@example.com", "John", "$500", "WD-123"
        );
        
        noOpEmailService.sendWithdrawalApprovedEmail(
            "creator@example.com", "John", "$500", "WD-123"
        );
        
        noOpEmailService.sendWithdrawalRejectedEmail(
            "creator@example.com", "John", "$500", "Invalid bank account"
        );
        
        noOpEmailService.sendKycApprovedEmail("creator@example.com", "John");
        
        noOpEmailService.sendKycRejectedEmail(
            "creator@example.com", "John", "Document not clear"
        );
    }
    
    @Test
    @DisplayName("Email service interface default methods should use sendEmail")
    void emailServiceInterface_defaultMethodsShouldUseSendEmail() {
        // Create a spy-like implementation to verify sendEmail is called
        TestableEmailService testableService = new TestableEmailService();
        
        testableService.sendKycApprovedEmail("test@example.com", "TestUser");
        
        assertThat(testableService.lastTo).isEqualTo("test@example.com");
        assertThat(testableService.lastSubject).contains("KYC Verification Approved");
        assertThat(testableService.lastBody).contains("TestUser");
    }
    
    /**
     * Testable EmailService that captures sent emails
     */
    private static class TestableEmailService implements EmailService {
        String lastTo;
        String lastSubject;
        String lastBody;
        
        @Override
        public void sendEmail(String to, String subject, String body) {
            this.lastTo = to;
            this.lastSubject = subject;
            this.lastBody = body;
        }
        
        @Override
        public void sendTemplatedEmail(String to, String templateId, Map<String, String> variables) {
            this.lastTo = to;
        }
        
        @Override
        public boolean isEnabled() {
            return true;
        }
    }
}
