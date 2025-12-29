package com.creatorx.api.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateCreatorProfileRequest {
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    private String username;
    
    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;
    
    @Pattern(regexp = "^https?://(www\\.)?(instagram\\.com|youtube\\.com|youtu\\.be|twitter\\.com|x\\.com)/.*", 
             message = "Invalid Instagram URL")
    private String instagramUrl;
    
    @Pattern(regexp = "^https?://(www\\.)?(youtube\\.com|youtu\\.be)/.*", 
             message = "Invalid YouTube URL")
    private String youtubeUrl;
    
    @Pattern(regexp = "^https?://(www\\.)?(twitter\\.com|x\\.com)/.*", 
             message = "Invalid Twitter/X URL")
    private String twitterUrl;
}

