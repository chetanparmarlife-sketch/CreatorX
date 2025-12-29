package com.creatorx.api.dto;

import com.creatorx.common.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LinkSupabaseUserRequest {
    @NotBlank(message = "Supabase user ID is required")
    private String supabaseUserId;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotNull(message = "Role is required")
    private UserRole role;
    
    // Optional fields for brand registration
    private String companyName;
    private String industry;
    private String website;
    private String phone;
}

