package com.creatorx.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

/**
 * Firebase Configuration
 * Initializes Firebase Admin SDK for FCM push notifications
 * 
 * This config is OPTIONAL - app will start without Firebase if not configured.
 * To enable, set firebase.enabled=true and provide service account credentials.
 */
@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-key:}")
    private String serviceAccountKeyPath;

    @Value("${firebase.project-id:}")
    private String projectId;

    @Value("${firebase.enabled:false}")
    private boolean firebaseEnabled;

    @Bean
    public Optional<FirebaseApp> firebaseApp() {
        if (!firebaseEnabled) {
            log.info("Firebase is disabled (firebase.enabled=false). FCM push notifications will not work.");
            return Optional.empty();
        }

        // Check if Firebase is already initialized
        if (!FirebaseApp.getApps().isEmpty()) {
            return Optional.of(FirebaseApp.getInstance());
        }

        try {
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
                try (InputStream serviceAccount = new ClassPathResource("firebase-service-account.json")
                        .getInputStream()) {
                    GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
                    optionsBuilder.setCredentials(credentials);
                    log.info("Firebase initialized from classpath service account key");
                } catch (Exception e) {
                    log.warn("Firebase service account key not found. FCM will not work. " +
                            "Set firebase.service-account-key property or add firebase-service-account.json to classpath.");
                    return Optional.empty();
                }
            }

            if (projectId != null && !projectId.isEmpty()) {
                optionsBuilder.setProjectId(projectId);
            }

            FirebaseOptions options = optionsBuilder.build();
            return Optional.of(FirebaseApp.initializeApp(options));
        } catch (IOException e) {
            log.error("Failed to initialize Firebase: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Bean
    public Optional<FirebaseMessaging> firebaseMessaging(Optional<FirebaseApp> firebaseApp) {
        if (firebaseApp.isEmpty()) {
            log.info("FirebaseMessaging not available - Firebase is not configured.");
            return Optional.empty();
        }
        return Optional.of(FirebaseMessaging.getInstance(firebaseApp.get()));
    }
}
