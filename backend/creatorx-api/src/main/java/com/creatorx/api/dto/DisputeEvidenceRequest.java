package com.creatorx.api.dto;

import lombok.Data;

@Data
public class DisputeEvidenceRequest {
    private String fileUrl;
    private String fileType;
    private String notes;
}
