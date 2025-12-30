package com.creatorx.api.dto;

import com.creatorx.common.enums.AppealStatus;
import lombok.Data;

@Data
public class AppealResolveRequest {
    private AppealStatus status;
    private String resolution;
}
