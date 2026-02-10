package com.creatorx.service;

import com.creatorx.common.settings.PlatformSettingKeys;
import com.creatorx.repository.PlatformSettingRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlatformSettingsResolver {
    private final PlatformSettingRepository platformSettingRepository;
    private final ObjectMapper objectMapper;

    public BigDecimal getDecimal(String key, BigDecimal defaultValue) {
        return getString(key)
                .map(value -> {
                    try {
                        return new BigDecimal(value);
                    } catch (Exception ignored) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    public Integer getInteger(String key, Integer defaultValue) {
        return getString(key)
                .map(value -> {
                    try {
                        return Integer.valueOf(value);
                    } catch (Exception ignored) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    public boolean getBoolean(String key, boolean defaultValue) {
        return getString(key)
                .map(value -> Boolean.parseBoolean(value))
                .orElse(defaultValue);
    }

    public List<String> getJsonStringList(String key) {
        return getString(key)
                .map(value -> {
                    try {
                        return objectMapper.readValue(value, new TypeReference<List<String>>() {});
                    } catch (Exception ignored) {
                        return Collections.<String>emptyList();
                    }
                })
                .orElse(Collections.emptyList());
    }

    public boolean isFeatureEnabled(String key, boolean defaultValue) {
        return getBoolean(key, defaultValue);
    }

    public boolean isCategoryAllowed(String category) {
        boolean enforcement = getBoolean(PlatformSettingKeys.FEATURE_CATEGORY_ENFORCEMENT, false);
        List<String> allowed = getJsonStringList(PlatformSettingKeys.CATEGORIES_ALLOWED_LIST);
        if (!enforcement || allowed.isEmpty()) {
            return true;
        }
        return allowed.stream().anyMatch(item -> item.equalsIgnoreCase(category));
    }

    public boolean isPayoutWindowOpen(LocalDateTime now) {
        if (!isFeatureEnabled(PlatformSettingKeys.FEATURE_WITHDRAWALS_ENABLED, true)) {
            return false;
        }

        List<String> allowedDays = getJsonStringList(PlatformSettingKeys.PAYOUT_ALLOWED_DAYS);
        if (!allowedDays.isEmpty()) {
            DayOfWeek today = now.getDayOfWeek();
            boolean matches = allowedDays.stream().anyMatch(day -> day.equalsIgnoreCase(today.name()));
            if (!matches) {
                return false;
            }
        }

        Integer startHour = getInteger(PlatformSettingKeys.PAYOUT_START_HOUR, null);
        Integer endHour = getInteger(PlatformSettingKeys.PAYOUT_END_HOUR, null);
        if (startHour == null || endHour == null) {
            return true;
        }

        int hour = now.getHour();
        if (startHour <= endHour) {
            return hour >= startHour && hour <= endHour;
        }
        return hour >= startHour || hour <= endHour;
    }

    private Optional<String> getString(String key) {
        try {
            return platformSettingRepository.findByKey(key).map(setting -> setting.getValue());
        } catch (Exception e) {
            // Fail safe if platform_settings table is missing or temporarily unavailable
            log.warn("Platform settings lookup failed for key {}: {}", key, e.getMessage());
            return Optional.empty();
        }
    }
}
