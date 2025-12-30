package com.creatorx.repository;

import com.creatorx.repository.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, String> {
    List<TeamMember> findByBrandId(String brandId);

    List<TeamMember> findByUserId(String userId);

    Optional<TeamMember> findByBrandIdAndEmail(String brandId, String email);

    boolean existsByBrandIdAndUserId(String brandId, String userId);
}
