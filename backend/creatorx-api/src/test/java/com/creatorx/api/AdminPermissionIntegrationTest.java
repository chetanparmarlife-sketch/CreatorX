package com.creatorx.api;

import com.creatorx.api.integration.BaseIntegrationTest;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.enums.UserStatus;
import com.creatorx.common.permissions.AdminPermissions;
import com.creatorx.repository.AdminPermissionRepository;
import com.creatorx.repository.entity.AdminPermission;
import com.creatorx.repository.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for Admin Permission system
 */
@DisplayName("Admin Permission Integration Tests")
class AdminPermissionIntegrationTest extends BaseIntegrationTest {

        @Autowired
        private AdminPermissionRepository adminPermissionRepository;

        private User adminWithPermission;
        private User adminWithoutPermission;

        @BeforeEach
        @Override
        public void setUpBaseTest() {
                super.setUpBaseTest();

                adminPermissionRepository.deleteAll();

                // Create admin with specific permissions
                adminWithPermission = userRepository.save(User.builder()
                                .email("admin-perm@example.com")
                                .passwordHash("test")
                                .role(UserRole.ADMIN)
                                .status(UserStatus.ACTIVE)
                                .build());

                // Create admin without permissions
                adminWithoutPermission = userRepository.save(User.builder()
                                .email("admin-no-perm@example.com")
                                .passwordHash("test")
                                .role(UserRole.ADMIN)
                                .status(UserStatus.ACTIVE)
                                .build());

                // Grant permissions to adminWithPermission
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
        @DisplayName("List users requires ADMIN_USERS_READ permission")
        void listUsersRequiresPermission() throws Exception {
                authenticateAs(adminWithoutPermission);

                mockMvc.perform(get("/api/v1/admin/users")
                                .with(csrf()))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("List users succeeds with permission")
        void listUsersWithPermissionSucceeds() throws Exception {
                authenticateAs(adminWithPermission);

                mockMvc.perform(get("/api/v1/admin/users")
                                .with(csrf()))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("System summary requires ADMIN_SYSTEM_READ permission")
        void systemSummaryRequiresPermission() throws Exception {
                authenticateAs(adminWithoutPermission);

                mockMvc.perform(get("/api/v1/admin/system/summary")
                                .with(csrf()))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("System summary succeeds with permission")
        void systemSummaryWithPermissionSucceeds() throws Exception {
                authenticateAs(adminWithPermission);

                mockMvc.perform(get("/api/v1/admin/system/summary")
                                .with(csrf()))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Moderation flags requires ADMIN_CAMPAIGN_MODERATION permission")
        void moderationFlagsRequiresPermission() throws Exception {
                authenticateAs(adminWithoutPermission);

                mockMvc.perform(get("/api/v1/admin/moderation/flags")
                                .with(csrf()))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Moderation flags succeeds with permission")
        void moderationFlagsWithPermissionSucceeds() throws Exception {
                authenticateAs(adminWithPermission);

                mockMvc.perform(get("/api/v1/admin/moderation/flags")
                                .with(csrf()))
                                .andExpect(status().isOk());
        }
}
