package com.creatorx.api.dto;

import com.creatorx.common.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password; // Not used in backend, Supabase handles it
    
    @NotNull(message = "Role is required")
    private UserRole role;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String phone;
}

