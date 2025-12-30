package com.creatorx.repository.entity;

import com.creatorx.common.enums.ModerationRuleSeverity;
import com.creatorx.common.enums.ModerationRuleStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "moderation_rules", indexes = {
    @Index(name = "idx_moderation_rules_status", columnList = "status"),
    @Index(name = "idx_moderation_rules_severity", columnList = "severity")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationRule extends BaseEntity {
    @Column(nullable = false, length = 120)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String pattern;

    @Column(nullable = false, length = 40)
    private String action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ModerationRuleSeverity severity = ModerationRuleSeverity.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ModerationRuleStatus status = ModerationRuleStatus.ACTIVE;
}
