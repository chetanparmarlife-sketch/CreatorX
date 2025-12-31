package com.creatorx.service.admin;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.enums.PlatformSettingType;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.PlatformSettingRepository;
import com.creatorx.repository.entity.PlatformSetting;
import com.creatorx.service.dto.PlatformSettingDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlatformSettingsService {
    private final PlatformSettingRepository platformSettingRepository;
    private final AdminAuditService adminAuditService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<PlatformSettingDTO> getSettings() {
        return platformSettingRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlatformSettingDTO getSetting(String key) {
        return platformSettingRepository.findByKey(key)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("PlatformSetting", key));
    }

    @Transactional
    public PlatformSettingDTO upsertSetting(String adminId, PlatformSettingDTO request) {
        validateSettingValue(request.getDataType(), request.getValue());
        PlatformSetting setting = platformSettingRepository.findByKey(request.getKey())
                .orElseGet(PlatformSetting::new);

        setting.setKey(request.getKey());
        setting.setValue(request.getValue());
        if (request.getDataType() != null) {
            setting.setDataType(request.getDataType());
        }
        setting.setDescription(request.getDescription());

        PlatformSetting saved = platformSettingRepository.save(setting);

        HashMap<String, Object> details = new HashMap<>();
        details.put("key", saved.getKey());
        details.put("value", saved.getValue());
        details.put("dataType", saved.getDataType() != null ? saved.getDataType().name() : null);

        adminAuditService.logAction(
                adminId,
                AdminActionType.SYSTEM_UPDATE,
                "PLATFORM_SETTING",
                saved.getKey(),
                details,
                null,
                null
        );

        return toDTO(saved);
    }

    private void validateSettingValue(PlatformSettingType dataType, String value) {
        if (dataType == null) {
            throw new IllegalArgumentException("Setting data type is required");
        }
        if (value == null) {
            throw new IllegalArgumentException("Setting value is required");
        }
        try {
            switch (dataType) {
                case NUMBER -> new BigDecimal(value);
                case BOOLEAN -> {
                    if (!"true".equalsIgnoreCase(value) && !"false".equalsIgnoreCase(value)) {
                        throw new IllegalArgumentException("Boolean settings must be true or false");
                    }
                }
                case JSON -> objectMapper.readTree(value);
                case STRING -> {
                    // No validation needed
                }
                default -> throw new IllegalArgumentException("Unsupported setting data type");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid value for " + dataType + " setting");
        }
    }

    private PlatformSettingDTO toDTO(PlatformSetting setting) {
        return PlatformSettingDTO.builder()
                .id(setting.getId())
                .key(setting.getKey())
                .value(setting.getValue())
                .dataType(setting.getDataType())
                .description(setting.getDescription())
                .build();
    }
}
