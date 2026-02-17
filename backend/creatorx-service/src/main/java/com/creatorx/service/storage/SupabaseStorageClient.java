package com.creatorx.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.io.InputStream;

/**
 * Supabase Storage REST API client
 * Uses WebClient for reactive HTTP requests
 */
@Slf4j
@Component
public class SupabaseStorageClient {
    
    private final WebClient webClient;
    private final String storageUrl;
    private final String serviceRoleKey;
    
    public SupabaseStorageClient(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.service.role.key:}") String serviceRoleKey
    ) {
        // Build correct Storage API base URL from Supabase project URL
        if (supabaseUrl.contains("/storage/v1")) {
            this.storageUrl = supabaseUrl;
        } else if (supabaseUrl.contains("/rest/v1")) {
            this.storageUrl = supabaseUrl.replace("/rest/v1", "/storage/v1");
        } else {
            this.storageUrl = supabaseUrl.replaceAll("/$", "") + "/storage/v1";
        }
        this.serviceRoleKey = serviceRoleKey;

        log.info("Supabase Storage URL: {}", this.storageUrl);

        this.webClient = WebClient.builder()
                .baseUrl(this.storageUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                .defaultHeader("apikey", serviceRoleKey)
                .build();
    }
    
    /**
     * Upload file to Supabase Storage
     */
    public Mono<String> uploadFile(
            InputStream fileInputStream,
            String bucket,
            String path,
            String contentType,
            long fileSize
    ) {
        try {
            // Read entire file into byte array for Content-Length support
            byte[] fileBytes = fileInputStream.readAllBytes();

            log.info("Uploading to Supabase: bucket={}, path={}, contentType={}, size={}",
                    bucket, path, contentType, fileBytes.length);

            return webClient.post()
                    .uri(uriBuilder -> uriBuilder.path("/object/" + bucket + "/" + path).build())
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileBytes.length))
                    .header("x-upsert", "true")
                    .bodyValue(fileBytes)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response ->
                            response.bodyToMono(String.class)
                                    .defaultIfEmpty("(empty body)")
                                    .flatMap(body -> {
                                        log.error("Supabase Storage error {}: {}", response.statusCode(), body);
                                        return Mono.error(new IOException(
                                                "Supabase Storage " + response.statusCode() + ": " + body));
                                    })
                    )
                    .bodyToMono(String.class)
                    .map(response -> buildFileUrl(bucket, path))
                    .doOnError(error -> log.error("Failed to upload file to Supabase: {}", error.getMessage()));

        } catch (Exception e) {
            log.error("Failed to read file for upload: {}", e.getMessage());
            return Mono.error(new IOException("Failed to upload file: " + e.getMessage(), e));
        }
    }
    
    /**
     * Delete file from Supabase Storage
     */
    public Mono<Void> deleteFile(String bucket, String path) {
        return webClient.delete()
                .uri(uriBuilder -> uriBuilder.path("/object/" + bucket + "/" + path).build())
                .retrieve()
                .bodyToMono(Void.class)
                .doOnError(error -> log.error("Failed to delete file from Supabase: {}", error.getMessage()))
                .onErrorMap(error -> new IOException("Failed to delete file: " + error.getMessage(), error));
    }
    
    /**
     * Generate signed URL for temporary access
     */
    public Mono<String> generateSignedUrl(String bucket, String path, int expiresIn) {
        return webClient.post()
                .uri(uriBuilder -> uriBuilder.path("/object/sign/" + bucket + "/" + path).build())
                .bodyValue(new SignedUrlRequest(expiresIn))
                .retrieve()
                .bodyToMono(SignedUrlResponse.class)
                .map(response -> buildSignedUrl(bucket, path, response.getSignedURL()))
                .doOnError(error -> log.error("Failed to generate signed URL: {}", error.getMessage()))
                .onErrorMap(error -> new IOException("Failed to generate signed URL: " + error.getMessage(), error));
    }
    
    private String buildFileUrl(String bucket, String path) {
        return String.format("%s/object/public/%s/%s", storageUrl, bucket, path);
    }
    
    private String buildSignedUrl(String bucket, String path, String token) {
        return String.format("%s/object/sign/%s/%s?token=%s", storageUrl, bucket, path, token);
    }
    
    // Inner classes for request/response
    
    private static class SignedUrlRequest {
        private final int expiresIn;
        
        public SignedUrlRequest(int expiresIn) {
            this.expiresIn = expiresIn;
        }
        
        public int getExpiresIn() {
            return expiresIn;
        }
    }
    
    private static class SignedUrlResponse {
        private String signedURL;
        
        public String getSignedURL() {
            return signedURL;
        }
        
        public void setSignedURL(String signedURL) {
            this.signedURL = signedURL;
        }
    }
}

