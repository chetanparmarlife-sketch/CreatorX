package com.creatorx.service.dto;

import com.creatorx.common.enums.DocumentStatus;
import com.creatorx.common.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KYCDocumentDTO {
    private String id;
    private String userId;
    private String userEmail;
    private DocumentType documentType;
    private String documentNumber;
    private String fileUrl;
    private String backImageUrl; // For AADHAAR
    private DocumentStatus status;
    private String rejectionReason;
    private String verifiedBy;
    private LocalDateTime submittedAt;
    private LocalDateTime verifiedAt;
}
