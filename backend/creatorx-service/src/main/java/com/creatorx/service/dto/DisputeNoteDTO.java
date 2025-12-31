package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeNoteDTO {
    private String id;
    private String disputeId;
    private String adminId;
    private String adminEmail;
    private String note;
    private LocalDateTime createdAt;
}
