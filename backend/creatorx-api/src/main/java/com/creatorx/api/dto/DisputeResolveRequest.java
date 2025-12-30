package com.creatorx.api.dto;

import com.creatorx.common.enums.DisputeStatus;
import lombok.Data;

@Data
public class DisputeResolveRequest {
    private DisputeStatus status;
    private String resolution;
}
