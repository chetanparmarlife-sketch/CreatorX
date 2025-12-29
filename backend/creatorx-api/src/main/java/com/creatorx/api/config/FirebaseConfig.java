package com.creatorx.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Firebase Configuration
 * Initializes Firebase Admin SDK for FCM push notifications
 */
@Slf4j
@Configuration
public class FirebaseConfig {
    
    @Value("${firebase.service-account-key:}")
    private String serviceAccountKeyPath;
    
    @Value("${firebase.project-id:}")
    private String projectId;
    
    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        // Check if Firebase is already initialized
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder();
            
            // Try to load service account key from file path
            if (serviceAccountKeyPath != null && !serviceAccountKeyPath.isEmpty()) {
                try (InputStream serviceAccount = new FileInputStream(serviceAccountKeyPath)) {
                    GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
                    optionsBuilder.setCredentials(credentials);
                    log.info("Firebase initialized from service account key file: {}", serviceAccountKeyPath);
                }
            } else {
                // Try to load from classpath (for packaged apps)
                try (InputStream serviceAccount = new ClassPathResource("firebase-service-account.json").getInputStream()) {
                    GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
                    optionsBuilder.setCredentials(credentials);
                    log.info("Firebase initialized from classpath service account key");
                } catch (Exception e) {
                    log.warn("Firebase service account key not found. FCM will not work. " +
                            "Set firebase.service-account-key property or add firebase-service-account.json to classpath.");
                    // Return null to allow app to start without Firebase (for development)
                    return null;
                }
            }
            
            if (projectId != null && !projectId.isEmpty()) {
                optionsBuilder.setProjectId(projectId);
            }
            
            FirebaseOptions options = optionsBuilder.build();
            return FirebaseApp.initializeApp(options);
        }
        
        return FirebaseApp.getInstance();
    }
    
    @Bean
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        if (firebaseApp == null) {
            log.warn("FirebaseApp is null. FCM will not work.");
            return null;
        }
        return FirebaseMessaging.getInstance(firebaseApp);
    }
}

