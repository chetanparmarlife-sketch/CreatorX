package com.creatorx.api.dto;

import com.creatorx.common.enums.GDPRRequestType;
import lombok.Data;

import java.util.Map;

@Data
public class GDPRRequestCreateRequest {
    private GDPRRequestType requestType;
    private Map<String, Object> details;
}
