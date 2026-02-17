package com.creatorx.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;

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
            // Convert InputStream to Flux<DataBuffer>
            Flux<DataBuffer> dataBufferFlux = DataBufferUtils.readInputStream(
                    () -> fileInputStream,
                    new org.springframework.core.io.buffer.DefaultDataBufferFactory(),
                    4096
            );
            
            return webClient.post()
                    .uri(uriBuilder -> uriBuilder.path("/object/" + bucket + "/" + path).build())
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(BodyInserters.fromDataBuffers(dataBufferFlux))
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(response -> buildFileUrl(bucket, path))
                    .doOnError(error -> log.error("Failed to upload file to Supabase: {}", error.getMessage()))
                    .onErrorMap(error -> new IOException("Failed to upload file: " + error.getMessage(), error));
                    
        } catch (Exception e) {
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

