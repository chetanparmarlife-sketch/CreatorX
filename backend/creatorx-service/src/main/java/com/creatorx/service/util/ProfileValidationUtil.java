package com.creatorx.service.util;

import com.creatorx.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;

import java.util.regex.Pattern;

/**
 * Profile validation utilities
 */
@Slf4j
public class ProfileValidationUtil {
    
    // Username pattern: 3-30 chars, alphanumeric + underscore
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,30}$");
    
    // Phone pattern: E.164 format (optional +, country code, number)
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[1-9]\\d{1,14}$");
    
    // Instagram URL pattern
    private static final Pattern INSTAGRAM_URL_PATTERN = 
            Pattern.compile("^https?://(www\\.)?instagram\\.com/.*");
    
    // YouTube URL pattern
    private static final Pattern YOUTUBE_URL_PATTERN = 
            Pattern.compile("^https?://(www\\.)?(youtube\\.com|youtu\\.be)/.*");
    
    // Twitter/X URL pattern
    private static final Pattern TWITTER_URL_PATTERN = 
            Pattern.compile("^https?://(www\\.)?(twitter\\.com|x\\.com)/.*");
    
    // GST number pattern: 15 chars, specific format
    private static final Pattern GST_PATTERN = 
            Pattern.compile("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$");
    
    /**
     * Validate username
     */
    public static void validateUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new BusinessException("Username is required");
        }
        
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new BusinessException("Username must be 3-30 characters and contain only letters, numbers, and underscores");
        }
    }
    
    /**
     * Validate phone number (E.164 format)
     */
    public static void validatePhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return; // Phone is optional
        }
        
        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new BusinessException("Invalid phone number format. Use E.164 format (e.g., +919876543210)");
        }
    }
    
    /**
     * Validate bio length
     */
    public static void validateBio(String bio) {
        if (bio != null && bio.length() > 500) {
            throw new BusinessException("Bio must not exceed 500 characters");
        }
    }
    
    /**
     * Validate Instagram URL
     */
    public static void validateInstagramUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return; // Optional
        }
        
        if (!INSTAGRAM_URL_PATTERN.matcher(url).matches()) {
            throw new BusinessException("Invalid Instagram URL format");
        }
    }
    
    /**
     * Validate YouTube URL
     */
    public static void validateYouTubeUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return; // Optional
        }
        
        if (!YOUTUBE_URL_PATTERN.matcher(url).matches()) {
            throw new BusinessException("Invalid YouTube URL format");
        }
    }
    
    /**
     * Validate Twitter/X URL
     */
    public static void validateTwitterUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return; // Optional
        }
        
        if (!TWITTER_URL_PATTERN.matcher(url).matches()) {
            throw new BusinessException("Invalid Twitter/X URL format");
        }
    }
    
    /**
     * Validate GST number
     */
    public static void validateGSTNumber(String gstNumber) {
        if (gstNumber == null || gstNumber.trim().isEmpty()) {
            return; // Optional
        }
        
        if (gstNumber.length() != 15) {
            throw new BusinessException("GST number must be exactly 15 characters");
        }
        
        if (!GST_PATTERN.matcher(gstNumber).matches()) {
            throw new BusinessException("Invalid GST number format");
        }
    }
    
    /**
     * Validate website URL
     */
    public static void validateWebsiteUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return; // Optional
        }
        
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new BusinessException("Website URL must start with http:// or https://");
        }
    }
}

