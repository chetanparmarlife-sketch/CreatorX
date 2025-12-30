package com.creatorx.service.admin;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.enums.AppealStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.enums.UserStatus;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.AccountAppealRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.AccountAppeal;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.AccountAppealDTO;
import com.creatorx.service.dto.AdminUserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository userRepository;
    private final AccountAppealRepository accountAppealRepository;
    private final AdminAuditService adminAuditService;

    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getUsers(UserRole role, UserStatus status, String search, Pageable pageable) {
        Specification<User> spec = Specification.where(null);

        if (role != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), role));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (search != null && !search.isBlank()) {
            String term = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("email")), term));
        }

        return userRepository.findAll(spec, pageable)
                .map(this::toDTO);
    }

    @Transactional
    public AdminUserDTO updateStatus(String adminId, String userId, UserStatus status, String reason) {
        User admin = requireAdmin(adminId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }

        user.setStatus(status);
        User updated = userRepository.save(user);

        HashMap<String, Object> details = new HashMap<>();
        details.put("status", status != null ? status.name() : null);
        details.put("reason", reason);

        adminAuditService.logAction(
                admin.getId(),
                status == UserStatus.SUSPENDED ? AdminActionType.USER_SUSPENDED : AdminActionType.USER_ACTIVATED,
                "USER",
                user.getId(),
                details,
                null,
                null
        );

        return toDTO(updated);
    }

    @Transactional
    public AccountAppealDTO submitAppeal(String userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        AccountAppeal appeal = AccountAppeal.builder()
                .user(user)
                .reason(reason)
                .status(AppealStatus.OPEN)
                .build();

        return toAppealDTO(accountAppealRepository.save(appeal));
    }

    @Transactional(readOnly = true)
    public Page<AccountAppealDTO> getAppeals(AppealStatus status, Pageable pageable) {
        if (status == null) {
            return accountAppealRepository.findAll(pageable).map(this::toAppealDTO);
        }
        return accountAppealRepository.findByStatus(status, pageable).map(this::toAppealDTO);
    }

    @Transactional(readOnly = true)
    public Page<AccountAppealDTO> getAppealsForUser(String userId, Pageable pageable) {
        return accountAppealRepository.findByUserId(userId, pageable).map(this::toAppealDTO);
    }

    @Transactional
    public AccountAppealDTO resolveAppeal(String adminId, String appealId, AppealStatus status, String resolution) {
        User admin = requireAdmin(adminId);
        AccountAppeal appeal = accountAppealRepository.findById(appealId)
                .orElseThrow(() -> new ResourceNotFoundException("Appeal", appealId));
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }

        appeal.setStatus(status);
        appeal.setResolution(resolution);
        appeal.setResolvedBy(admin);
        appeal.setResolvedAt(LocalDateTime.now());

        AccountAppeal updated = accountAppealRepository.save(appeal);

        HashMap<String, Object> details = new HashMap<>();
        details.put("appealStatus", status != null ? status.name() : null);
        details.put("resolution", resolution);

        adminAuditService.logAction(
                admin.getId(),
                AdminActionType.SYSTEM_UPDATE,
                "APPEAL",
                updated.getId(),
                details,
                null,
                null
        );

        return toAppealDTO(updated);
    }

    private User requireAdmin(String adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new ResourceNotFoundException("Admin", adminId);
        }
        return admin;
    }

    private AdminUserDTO toDTO(User user) {
        return AdminUserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .fullName(user.getUserProfile() != null ? user.getUserProfile().getFullName() : null)
                .companyName(user.getBrandProfile() != null ? user.getBrandProfile().getCompanyName() : null)
                .creatorUsername(user.getCreatorProfile() != null ? user.getCreatorProfile().getUsername() : null)
                .build();
    }

    private AccountAppealDTO toAppealDTO(AccountAppeal appeal) {
        return AccountAppealDTO.builder()
                .id(appeal.getId())
                .userId(appeal.getUser().getId())
                .userEmail(appeal.getUser().getEmail())
                .status(appeal.getStatus())
                .reason(appeal.getReason())
                .resolution(appeal.getResolution())
                .resolvedBy(appeal.getResolvedBy() != null ? appeal.getResolvedBy().getId() : null)
                .createdAt(appeal.getCreatedAt())
                .resolvedAt(appeal.getResolvedAt())
                .build();
    }
}
