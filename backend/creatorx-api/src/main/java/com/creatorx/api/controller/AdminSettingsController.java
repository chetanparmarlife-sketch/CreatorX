package com.creatorx.api.controller;

import com.creatorx.service.admin.PlatformSettingsService;
import com.creatorx.service.dto.PlatformSettingDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
@Tag(name = "Admin Settings", description = "Platform settings endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminSettingsController {
    private final PlatformSettingsService platformSettingsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List settings")
    public List<PlatformSettingDTO> listSettings() {
        return platformSettingsService.getSettings();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upsert setting")
    public PlatformSettingDTO upsertSetting(@RequestBody PlatformSettingDTO request) {
        return platformSettingsService.upsertSetting(request);
    }
}
