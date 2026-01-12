package com.creatorx.repository.entity;

import com.creatorx.common.enums.PlatformSettingType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "platform_settings", indexes = {
    @Index(name = "idx_platform_settings_key", columnList = "setting_key")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSetting extends BaseEntity {
    @Column(name = "setting_key", nullable = false, unique = true, length = 120)
    private String key;

    @Column(name = "setting_value", nullable = false, columnDefinition = "TEXT")
    private String value;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false)
    @Builder.Default
    private PlatformSettingType dataType = PlatformSettingType.STRING;

    @Column(columnDefinition = "TEXT")
    private String description;
}
