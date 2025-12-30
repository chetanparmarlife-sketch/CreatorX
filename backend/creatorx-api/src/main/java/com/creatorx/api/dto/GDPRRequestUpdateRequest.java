package com.creatorx.api.dto;

import com.creatorx.common.enums.GDPRRequestStatus;
import lombok.Data;

@Data
public class GDPRRequestUpdateRequest {
    private GDPRRequestStatus status;
    private String exportUrl;
}
