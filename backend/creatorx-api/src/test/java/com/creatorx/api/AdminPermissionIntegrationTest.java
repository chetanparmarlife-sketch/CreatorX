package com.creatorx.api;

import com.creatorx.common.enums.UserRole;
import com.creatorx.common.enums.UserStatus;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.repository.AdminPermissionRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.AdminPermission;
import com.creatorx.repository.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminPermissionIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminPermissionRepository adminPermissionRepository;

    private User adminWithPermission;
    private User adminWithoutPermission;

    @BeforeEach
    void setUp() {
        adminPermissionRepository.deleteAll();
        userRepository.deleteAll();

        adminWithPermission = userRepository.save(User.builder()
                .email("admin-perm@example.com")
                .passwordHash("test")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        adminWithoutPermission = userRepository.save(User.builder()
                .email("admin-no-perm@example.com")
                .passwordHash("test")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        adminPermissionRepository.save(AdminPermission.builder()
                .admin(adminWithPermission)
                .permission(AdminPermissions.ADMIN_USERS_READ)
                .build());
        adminPermissionRepository.save(AdminPermission.builder()
                .admin(adminWithPermission)
                .permission(AdminPermissions.ADMIN_SYSTEM_READ)
                .build());
        adminPermissionRepository.save(AdminPermission.builder()
                .admin(adminWithPermission)
                .permission(AdminPermissions.ADMIN_CAMPAIGN_MODERATION)
                .build());
    }

    @Test
    void listUsersRequiresPermission() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .with(user(adminWithoutPermission.getId()).roles("ADMIN")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listUsersWithPermissionSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .with(user(adminWithPermission.getId()).roles("ADMIN")))
                .andExpect(status().isOk());
    }

    @Test
    void systemSummaryRequiresPermission() throws Exception {
        mockMvc.perform(get("/api/v1/admin/system/summary")
                        .with(user(adminWithoutPermission.getId()).roles("ADMIN")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void systemSummaryWithPermissionSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/admin/system/summary")
                        .with(user(adminWithPermission.getId()).roles("ADMIN")))
                .andExpect(status().isOk());
    }

    @Test
    void moderationFlagsRequiresPermission() throws Exception {
        mockMvc.perform(get("/api/v1/admin/moderation/flags")
                        .with(user(adminWithoutPermission.getId()).roles("ADMIN")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void moderationFlagsWithPermissionSucceeds() throws Exception {
        mockMvc.perform(get("/api/v1/admin/moderation/flags")
                        .with(user(adminWithPermission.getId()).roles("ADMIN")))
                .andExpect(status().isOk());
    }
}
