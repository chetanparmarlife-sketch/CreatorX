package com.creatorx.api.dto;

import com.creatorx.common.enums.DisputeStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DisputeResolveRequest {
    private DisputeStatus status;
    private String resolution;
    private String resolutionType;
    private BigDecimal actionAmount;
}
