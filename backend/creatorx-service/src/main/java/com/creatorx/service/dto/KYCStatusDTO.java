package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KYCStatusDTO {
    private boolean isVerified;
    private String overallStatus; // NOT_SUBMITTED, PENDING, APPROVED, REJECTED
    private List<KYCDocumentDTO> documents;
}

