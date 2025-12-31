package com.creatorx.api.dto;

import lombok.Data;

@Data
public class AdminSessionEventRequest {
    private String eventType;
    private String path;
}
