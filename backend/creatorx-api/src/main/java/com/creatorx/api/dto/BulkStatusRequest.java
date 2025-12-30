package com.creatorx.api.dto;

import com.creatorx.common.enums.ApplicationStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BulkStatusRequest {
    @NotEmpty
    private List<String> applicationIds;

    @NotNull
    private ApplicationStatus status;

    private String reason;
}
