package com.creatorx.api.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateBrandProfileRequest {
    @Size(min = 1, max = 255, message = "Company name must be between 1 and 255 characters")
    private String companyName;
    
    @Pattern(regexp = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", 
             message = "Invalid GST number format")
    @Size(min = 15, max = 15, message = "GST number must be exactly 15 characters")
    private String gstNumber;
    
    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String industry;
    
    @Pattern(regexp = "^https?://.*", message = "Invalid website URL")
    private String website;
    
    @Size(max = 2000, message = "Company description must not exceed 2000 characters")
    private String companyDescription;
}

