package com.creatorx.api.dto;

import com.creatorx.common.enums.UserStatus;
import lombok.Data;

@Data
public class AdminUserStatusRequest {
    private UserStatus status;
    private String reason;
}
