package com.creatorx.api.dto;

import com.creatorx.common.enums.DocumentStatus;
import lombok.Data;

import java.util.List;

@Data
public class KycBulkReviewRequest {
    private List<String> documentIds;
    private DocumentStatus status;
    private String reason;
}
