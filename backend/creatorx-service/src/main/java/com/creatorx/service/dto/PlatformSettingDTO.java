package com.creatorx.service.dto;

import com.creatorx.common.enums.PlatformSettingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettingDTO {
    private String id;
    private String key;
    private String value;
    private PlatformSettingType dataType;
    private String description;
}
