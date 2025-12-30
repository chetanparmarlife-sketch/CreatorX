package com.creatorx.api.dto;

import lombok.Data;

import java.util.List;

@Data
public class AdminPermissionsRequest {
    private List<String> permissions;
}
