package com.creatorx.repository;

import com.creatorx.common.enums.ModerationRuleStatus;
import com.creatorx.repository.entity.ModerationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModerationRuleRepository extends JpaRepository<ModerationRule, String> {
    @Query("SELECT r FROM ModerationRule r WHERE r.status = :status ORDER BY r.createdAt DESC")
    List<ModerationRule> findByStatus(@Param("status") ModerationRuleStatus status);
}
