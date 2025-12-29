package com.creatorx.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Supabase Configuration
 * Configures Supabase client settings
 * Note: Actual client is created in SupabaseStorageClient
 */
@Slf4j
@Configuration
public class SupabaseConfig {
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.service.role.key:}")
    private String supabaseServiceRoleKey;
    
    @Value("${supabase.storage.bucket.avatars:avatars}")
    private String avatarsBucket;
    
    @Value("${supabase.storage.bucket.kyc:kyc-documents}")
    private String kycBucket;
    
    @Value("${supabase.storage.bucket.deliverables:deliverables}")
    private String deliverablesBucket;
    
    @Value("${supabase.storage.bucket.portfolio:portfolio}")
    private String portfolioBucket;
    
    // Configuration is done via @Value annotations
    // SupabaseStorageClient uses these values directly
}

