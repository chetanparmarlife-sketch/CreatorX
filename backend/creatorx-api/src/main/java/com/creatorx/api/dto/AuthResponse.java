package com.creatorx.api.dto;

import com.creatorx.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Auth response matching frontend expectations:
 * { accessToken, refreshToken, user: { id, email, role, ... }, message }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private AuthUserInfo user;
    private String message;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthUserInfo {
        private String id;
        private String email;
        private UserRole role;
        private String name;
        private String supabaseUserId;
        private Boolean emailVerified;
        private Boolean phoneVerified;
        private String createdAt;
    }
}
