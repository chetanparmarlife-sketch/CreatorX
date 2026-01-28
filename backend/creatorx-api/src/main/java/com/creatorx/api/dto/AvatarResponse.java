package com.creatorx.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response for avatar/logo upload endpoints.
 * Returns the uploaded file URL in a structured format.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvatarResponse {
    private String avatarUrl;
}
