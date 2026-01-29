package com.creatorx.service;

import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.TeamMemberInvitationRepository;
import com.creatorx.repository.TeamMemberRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.TeamMemberInvitation;
import com.creatorx.repository.entity.TeamMember;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.TeamMemberDTO;
import com.creatorx.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

/**
 * Service for team member management
 *
 * Features:
 * - Team member invitation with email notifications
 * - Role-based access (ADMIN, MANAGER, VIEWER)
 * - Invitation token management with expiry
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TeamMemberService {

    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamMemberInvitationRepository invitationRepository;
    private final EmailService emailService;
    
    /**
     * Invite team member
     */
    @Transactional
    public void inviteTeamMemberForUser(String actingUserId, String email, String role) {
        String brandId = resolveBrandId(actingUserId);
        ensureCanManageTeam(actingUserId, brandId);

        // Validate role
        if (!isValidRole(role)) {
            throw new BusinessException("Invalid role. Allowed roles: ADMIN, MANAGER, VIEWER");
        }

        if (teamMemberRepository.findByBrandIdAndEmail(brandId, email).isPresent()) {
            throw new BusinessException("Team member already invited");
        }
        
        // Check if user exists
        User user = userRepository.findByEmail(email)
                .orElse(null);
        
        User brand = userRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("User", brandId));

        if (user != null) {
            // User already exists - add them directly as team member
            TeamMember member = TeamMember.builder()
                    .brand(brand)
                    .user(user)
                    .email(email)
                    .role(role)
                    .status("ACTIVE")
                    .joinedAt(LocalDateTime.now())
                    .invitedBy(brand)
                    .build();
            teamMemberRepository.save(member);

            // Send notification email to existing user (they were added directly)
            sendInvitationEmail(email, user.getEmail(), brand.getEmail(), role, null);
        } else {
            // User doesn't exist - create invitation with token
            String token = generateToken();
            TeamMemberInvitation invitation = invitationRepository
                    .findByBrandIdAndEmailAndStatus(brandId, email, "INVITED")
                    .orElse(TeamMemberInvitation.builder().brand(brand).email(email).build());

            invitation.setRole(role);
            invitation.setToken(token);
            invitation.setStatus("INVITED");
            invitation.setInvitedBy(brand);
            invitation.setAcceptedAt(null);
            invitationRepository.save(invitation);

            // Send invitation email with token to new user
            sendInvitationEmail(email, null, brand.getEmail(), role, token);
        }
    }

    /**
     * Send team invitation email
     */
    private void sendInvitationEmail(String toEmail, String inviteeName, String brandName, String role, String token) {
        try {
            if (emailService.isEnabled()) {
                emailService.sendTeamInvitationEmail(toEmail, inviteeName, brandName, role, token != null ? token : "direct-add");
                log.info("Team invitation email sent to: {} for brand: {} role: {}", toEmail, brandName, role);
            } else {
                log.debug("Email service disabled, skipping invitation email to: {}", toEmail);
            }
        } catch (Exception e) {
            // Don't fail the invitation if email fails
            log.warn("Failed to send team invitation email to {}: {}", toEmail, e.getMessage());
        }
    }
    
    /**
     * Get team members
     */
    @Transactional(readOnly = true)
    public List<TeamMemberDTO> getTeamMembersForUser(String actingUserId) {
        String brandId = resolveBrandId(actingUserId);
        List<TeamMemberDTO> results = new ArrayList<>();

        User brand = userRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("User", brandId));

        if (!teamMemberRepository.existsByBrandIdAndUserId(brandId, brandId)) {
            TeamMember owner = TeamMember.builder()
                    .brand(brand)
                    .user(brand)
                    .email(brand.getEmail())
                    .role("ADMIN")
                    .status("ACTIVE")
                    .joinedAt(brand.getCreatedAt() != null ? brand.getCreatedAt() : LocalDateTime.now())
                    .invitedBy(brand)
                    .build();
            teamMemberRepository.save(owner);
        }

        teamMemberRepository.findByBrandId(brandId).forEach((member) -> {
            String name = member.getUser() != null ? member.getUser().getEmail() : member.getEmail();
            results.add(TeamMemberDTO.builder()
                    .id(member.getId())
                    .email(member.getEmail())
                    .name(name)
                    .role(member.getRole())
                    .status(member.getStatus())
                    .invitedAt(member.getInvitedAt())
                    .joinedAt(member.getJoinedAt())
                    .invitedBy(member.getInvitedBy() != null ? member.getInvitedBy().getEmail() : null)
                    .build());
        });

        invitationRepository.findByBrandIdAndStatus(brandId, "INVITED")
                .forEach((invite) -> results.add(TeamMemberDTO.builder()
                        .id(invite.getId())
                        .email(invite.getEmail())
                        .name(invite.getEmail())
                        .role(invite.getRole())
                        .status(invite.getStatus())
                        .invitedAt(invite.getInvitedAt())
                        .invitedBy(invite.getInvitedBy() != null ? invite.getInvitedBy().getEmail() : null)
                        .build()));

        return results;
    }
    
    /**
     * Remove team member
     */
    @Transactional
    public void removeTeamMemberForUser(String actingUserId, String teamMemberId) {
        String brandId = resolveBrandId(actingUserId);
        ensureCanManageTeam(actingUserId, brandId);
        TeamMember member = teamMemberRepository.findById(teamMemberId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", teamMemberId));

        if (!member.getBrand().getId().equals(brandId)) {
            throw new BusinessException("You can only remove team members from your brand");
        }

        teamMemberRepository.delete(member);
    }

    @Transactional
    public void acceptInvitation(String token, String userId) {
        TeamMemberInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMemberInvitation", token));

        if (!"INVITED".equals(invitation.getStatus())) {
            throw new BusinessException("Invitation is no longer valid");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!user.getEmail().equalsIgnoreCase(invitation.getEmail())) {
            throw new BusinessException("Invitation email does not match authenticated user");
        }

        TeamMember member = TeamMember.builder()
                .brand(invitation.getBrand())
                .user(user)
                .email(invitation.getEmail())
                .role(invitation.getRole())
                .status("ACTIVE")
                .joinedAt(LocalDateTime.now())
                .invitedBy(invitation.getInvitedBy())
                .build();

        teamMemberRepository.save(member);

        invitation.setStatus("ACCEPTED");
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    private String resolveBrandId(String userId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserId(userId);
        if (memberships.isEmpty()) {
            return userId;
        }
        return memberships.get(0).getBrand().getId();
    }

    private void ensureCanManageTeam(String actingUserId, String brandId) {
        if (actingUserId.equals(brandId)) {
            return;
        }
        List<TeamMember> memberships = teamMemberRepository.findByUserId(actingUserId);
        TeamMember membership = memberships.stream()
                .filter((member) -> member.getBrand().getId().equals(brandId))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Team member not part of this brand"));

        if (!"ADMIN".equals(membership.getRole())) {
            throw new BusinessException("Only admins can manage team members");
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
    
    private boolean isValidRole(String role) {
        return role != null && (role.equals("ADMIN") || role.equals("MANAGER") || role.equals("VIEWER"));
    }
}
