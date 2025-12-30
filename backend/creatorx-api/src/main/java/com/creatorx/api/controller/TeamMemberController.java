package com.creatorx.api.controller;

import com.creatorx.api.dto.InviteRequest;
import com.creatorx.repository.entity.User;
import com.creatorx.service.TeamMemberService;
import com.creatorx.service.dto.TeamMemberDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Team Member Controller
 * 
 * Note: This is a simplified implementation. In production, you would need:
 * - TeamMember entity and repository
 * - Email service for sending invitations
 * - Proper role management
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/team-members")
@Tag(name = "Team Members", description = "Team member management for brands")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TeamMemberController {
    
    private final TeamMemberService teamMemberService;
    
    /**
     * Invite team member
     */
    @PostMapping("/invite")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Invite team member", description = "Invite a team member to the brand account (Brand only)")
    public ResponseEntity<Void> inviteTeamMember(@Valid @RequestBody InviteRequest request) {
        User currentUser = getCurrentUser();
        teamMemberService.inviteTeamMemberForUser(currentUser.getId(), request.getEmail(), request.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    
    /**
     * Get team members
     */
    @GetMapping
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get team members", description = "Get list of team members for the brand (Brand only)")
    public ResponseEntity<List<TeamMemberDTO>> getTeamMembers() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        List<TeamMemberDTO> teamMembers = teamMemberService.getTeamMembersForUser(currentUser.getId());
        return ResponseEntity.ok(teamMembers);
    }
    
    /**
     * Remove team member
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Remove team member", description = "Remove a team member from the brand (Brand only)")
    public ResponseEntity<Void> removeTeamMember(@PathVariable String id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        teamMemberService.removeTeamMemberForUser(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Accept team invitation
     */
    @PostMapping("/accept")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Accept team invitation", description = "Accept a team invitation using token")
    public ResponseEntity<Void> acceptInvitation(@RequestBody java.util.Map<String, String> body) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        String token = body != null ? body.get("token") : null;
        if (token == null || token.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Invitation token is required");
        }
        teamMemberService.acceptInvitation(token, currentUser.getId());
        return ResponseEntity.ok().build();
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        log.warn("Authentication principal is not a User instance: {}", principal != null ? principal.getClass() : "null");
        throw new org.springframework.security.access.AccessDeniedException("Invalid authentication principal");
    }
}
