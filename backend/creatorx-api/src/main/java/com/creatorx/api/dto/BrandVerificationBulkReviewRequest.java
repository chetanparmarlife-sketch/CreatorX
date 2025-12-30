package com.creatorx.api.dto;

import lombok.Data;

import java.util.List;

@Data
public class BrandVerificationBulkReviewRequest {
    private List<String> documentIds;
    private String status;
    private String reason;
}
