package com.creatorx.service.admin;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.AdminActionRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.AdminAction;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.AdminActionDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAuditService {
    private final AdminActionRepository adminActionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(
            String adminId,
            AdminActionType actionType,
            String entityType,
            String entityId,
            Map<String, Object> details,
            String ipAddress,
            String userAgent
    ) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));

        InetAddress parsedIp = null;
        if (ipAddress != null && !ipAddress.isBlank()) {
            try {
                parsedIp = InetAddress.getByName(ipAddress);
            } catch (Exception ignored) {
                parsedIp = null;
            }
        }

        AdminAction action = AdminAction.builder()
                .admin(admin)
                .actionType(actionType)
                .entityType(entityType)
                .entityId(entityId)
                .detailsJson(details != null ? details : new HashMap<>())
                .ipAddress(parsedIp)
                .userAgent(userAgent)
                .build();

        adminActionRepository.save(action);
    }

    @Transactional(readOnly = true)
    public Page<AdminActionDTO> getActions(
            String adminId,
            AdminActionType actionType,
            String entityType,
            String entityId,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable
    ) {
        Specification<AdminAction> spec = Specification.where(null);

        if (adminId != null && !adminId.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("admin").get("id"), adminId));
        }
        if (actionType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("actionType"), actionType));
        }
        if (entityType != null && !entityType.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("entityType"), entityType));
        }
        if (entityId != null && !entityId.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("entityId"), entityId));
        }
        if (from != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        }
        if (to != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
        }

        return adminActionRepository.findAll(spec, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public String exportCsv(
            String adminId,
            AdminActionType actionType,
            String entityType,
            String entityId,
            LocalDateTime from,
            LocalDateTime to
    ) {
        Specification<AdminAction> spec = buildSpec(adminId, actionType, entityType, entityId, from, to);
        List<AdminAction> actions = adminActionRepository.findAll(spec, org.springframework.data.domain.Sort.by("createdAt").descending());

        String header = "id,adminId,adminEmail,actionType,entityType,entityId,createdAt,ipAddress,userAgent,details";
        return actions.stream()
                .map(this::toCsvRow)
                .collect(Collectors.joining("\n", header + "\n", "\n"));
    }

    private Specification<AdminAction> buildSpec(
            String adminId,
            AdminActionType actionType,
            String entityType,
            String entityId,
            LocalDateTime from,
            LocalDateTime to
    ) {
        Specification<AdminAction> spec = Specification.where(null);

        if (adminId != null && !adminId.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("admin").get("id"), adminId));
        }
        if (actionType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("actionType"), actionType));
        }
        if (entityType != null && !entityType.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("entityType"), entityType));
        }
        if (entityId != null && !entityId.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("entityId"), entityId));
        }
        if (from != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        }
        if (to != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), to));
        }

        return spec;
    }

    private String toCsvRow(AdminAction action) {
        String detailsJson = "";
        try {
            if (action.getDetailsJson() != null) {
                detailsJson = objectMapper.writeValueAsString(action.getDetailsJson());
            }
        } catch (Exception ignored) {
            detailsJson = "";
        }

        return String.join(",",
                csvEscape(action.getId()),
                csvEscape(action.getAdmin().getId()),
                csvEscape(action.getAdmin().getEmail()),
                csvEscape(action.getActionType().name()),
                csvEscape(action.getEntityType()),
                csvEscape(action.getEntityId()),
                csvEscape(action.getCreatedAt() != null ? action.getCreatedAt().toString() : null),
                csvEscape(action.getIpAddress() != null ? action.getIpAddress().getHostAddress() : null),
                csvEscape(action.getUserAgent()),
                csvEscape(detailsJson)
        );
    }

    private String csvEscape(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\r")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    private AdminActionDTO toDTO(AdminAction action) {
        return AdminActionDTO.builder()
                .id(action.getId())
                .adminId(action.getAdmin().getId())
                .adminEmail(action.getAdmin().getEmail())
                .actionType(action.getActionType())
                .entityType(action.getEntityType())
                .entityId(action.getEntityId())
                .details(action.getDetailsJson())
                .ipAddress(action.getIpAddress() != null ? action.getIpAddress().getHostAddress() : null)
                .userAgent(action.getUserAgent())
                .createdAt(action.getCreatedAt())
                .build();
    }
}
