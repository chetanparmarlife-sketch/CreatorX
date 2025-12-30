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
public class DeliverableDTO {
    private String id;
    private String applicationId;
    private String campaignId;
    private String campaignTitle;
    private String creatorId;
    private String creatorName;
    private CampaignDeliverableDTO campaignDeliverable;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String description;
    private SubmissionStatus status;
    private String feedback; // from brand review
    private String revisionNotes; // revision notes if REVISION_REQUESTED
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime updatedAt;
    private Integer versionNumber; // version number for this deliverable
    private Boolean isLatest; // is this the latest version
}
