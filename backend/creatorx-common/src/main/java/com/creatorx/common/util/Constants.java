package com.creatorx.common.util;

public class Constants {
    public static final String API_VERSION = "/api/v1";
    public static final String AUTH_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String JWT_SECRET_ENV = "JWT_SECRET";
    public static final String JWT_EXPIRATION_ENV = "JWT_EXPIRATION_MS";
    
    // Cache keys
    public static final String CACHE_CAMPAIGNS = "campaigns";
    public static final String CACHE_USER_PROFILE = "user_profile";
    public static final String CACHE_WALLET = "wallet";
    
    // Pagination
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
    
    private Constants() {
        // Utility class
    }
}




