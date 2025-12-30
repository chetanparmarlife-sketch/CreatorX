package com.creatorx.repository;

import com.creatorx.repository.entity.TeamMemberInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamMemberInvitationRepository extends JpaRepository<TeamMemberInvitation, String> {
    Optional<TeamMemberInvitation> findByToken(String token);

    Optional<TeamMemberInvitation> findByBrandIdAndEmailAndStatus(String brandId, String email, String status);

    List<TeamMemberInvitation> findByBrandIdAndStatus(String brandId, String status);
}
