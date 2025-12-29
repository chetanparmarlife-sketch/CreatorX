package com.creatorx.service.dto;

import com.creatorx.common.enums.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliverableHistoryDTO {
    private String submissionId;
    private String fileUrl;
    private String description;
    private SubmissionStatus status;
    private String feedback;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private Integer versionNumber;
}

