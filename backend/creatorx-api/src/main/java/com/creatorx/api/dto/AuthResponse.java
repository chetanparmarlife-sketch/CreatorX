package com.creatorx.api.dto;

import com.creatorx.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String userId;
    private String email;
    private UserRole role;
    private String supabaseUserId;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private String message;
    // Token fields (optional, for direct backend auth if Supabase not available)
    private String accessToken;
    private String refreshToken;
}

