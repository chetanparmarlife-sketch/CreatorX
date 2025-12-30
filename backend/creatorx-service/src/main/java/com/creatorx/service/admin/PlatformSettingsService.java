package com.creatorx.service.admin;

import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.PlatformSettingRepository;
import com.creatorx.repository.entity.PlatformSetting;
import com.creatorx.service.dto.PlatformSettingDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlatformSettingsService {
    private final PlatformSettingRepository platformSettingRepository;

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
    public PlatformSettingDTO upsertSetting(PlatformSettingDTO request) {
        PlatformSetting setting = platformSettingRepository.findByKey(request.getKey())
                .orElseGet(PlatformSetting::new);

        setting.setKey(request.getKey());
        setting.setValue(request.getValue());
        if (request.getDataType() != null) {
            setting.setDataType(request.getDataType());
        }
        setting.setDescription(request.getDescription());

        return toDTO(platformSettingRepository.save(setting));
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
