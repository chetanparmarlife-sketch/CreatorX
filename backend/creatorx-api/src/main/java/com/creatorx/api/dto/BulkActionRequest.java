package com.creatorx.api.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class BulkActionRequest {
    private String actionType;
    private List<String> entityIds;
    private String status;
    private String reason;
    private String feedback;
    private Map<String, Object> metadata;
}
