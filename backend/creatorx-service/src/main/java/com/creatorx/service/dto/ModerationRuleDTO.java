package com.creatorx.service.dto;

import com.creatorx.common.enums.ModerationRuleSeverity;
import com.creatorx.common.enums.ModerationRuleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationRuleDTO {
    private String id;
    private String name;
    private String description;
    private String pattern;
    private String action;
    private ModerationRuleSeverity severity;
    private ModerationRuleStatus status;
    private LocalDateTime createdAt;
    private Long totalFlags;
    private Long openFlags;
    private LocalDateTime lastTriggeredAt;
}
