package com.creatorx.service.admin;

import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.AdminPermissionRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.AdminPermission;
import com.creatorx.repository.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPermissionService {
    private final AdminPermissionRepository adminPermissionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public boolean hasPermission(String adminId, String permission) {
        User admin = requireAdmin(adminId);
        if (permission == null || permission.isBlank()) {
            return true;
        }
        return adminPermissionRepository.existsByAdminIdAndPermission(admin.getId(), permission);
    }

    @Transactional(readOnly = true)
    public List<String> getPermissions(String adminId) {
        requireAdmin(adminId);
        return adminPermissionRepository.findByAdminId(adminId).stream()
                .map(AdminPermission::getPermission)
                .sorted()
                .toList();
    }

    @Transactional
    public void grantPermission(String adminId, String permission) {
        User admin = requireAdmin(adminId);
        if (permission == null || permission.isBlank()) {
            return;
        }
        if (!adminPermissionRepository.existsByAdminIdAndPermission(admin.getId(), permission)) {
            AdminPermission record = AdminPermission.builder()
                    .admin(admin)
                    .permission(permission)
                    .build();
            adminPermissionRepository.save(record);
        }
    }

    @Transactional
    public void revokePermission(String adminId, String permission) {
        requireAdmin(adminId);
        if (permission == null || permission.isBlank()) {
            return;
        }
        adminPermissionRepository.findByAdminId(adminId).stream()
                .filter(entry -> permission.equals(entry.getPermission()))
                .forEach(adminPermissionRepository::delete);
    }

    @Transactional
    public void replacePermissions(String adminId, List<String> permissions) {
        requireAdmin(adminId);
        Set<String> normalized = permissions == null
                ? new HashSet<>()
                : permissions.stream()
                .filter(value -> value != null && !value.isBlank())
                .collect(Collectors.toSet());

        List<AdminPermission> existing = adminPermissionRepository.findByAdminId(adminId);
        existing.stream()
                .filter(entry -> !normalized.contains(entry.getPermission()))
                .forEach(adminPermissionRepository::delete);

        for (String permission : normalized) {
            if (!adminPermissionRepository.existsByAdminIdAndPermission(adminId, permission)) {
                adminPermissionRepository.save(AdminPermission.builder()
                        .admin(userRepository.getReferenceById(adminId))
                        .permission(permission)
                        .build());
            }
        }
    }

    private User requireAdmin(String adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new ResourceNotFoundException("Admin", adminId);
        }
        return admin;
    }
}
