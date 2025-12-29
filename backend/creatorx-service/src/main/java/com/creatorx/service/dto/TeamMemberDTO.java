package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for team member information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberDTO {
    private String id;
    private String email;
    private String name;
    private String role;
    private String status; // ACTIVE, PENDING, INACTIVE
    private LocalDateTime invitedAt;
    private LocalDateTime joinedAt;
    private String invitedBy;
}

