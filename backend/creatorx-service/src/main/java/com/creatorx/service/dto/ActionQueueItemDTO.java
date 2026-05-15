package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionQueueItemDTO {
    private String id;
    private String type;
    private String severity;
    private String dueState;
    private String entityId;
    private String title;
    private String subtitle;
    private String primaryAction;
    private String href;
    private Instant createdAt;
    private Map<String, Object> metadata;
}
