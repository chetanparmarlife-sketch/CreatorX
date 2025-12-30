package com.creatorx.service.admin;

import com.creatorx.common.enums.GDPRRequestStatus;
import com.creatorx.common.enums.GDPRRequestType;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.GDPRRequestRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.GDPRRequest;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.GDPRRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ComplianceService {
    private final GDPRRequestRepository gdprRequestRepository;
    private final UserRepository userRepository;
    private final AdminAuditService adminAuditService;

    @Transactional
    public GDPRRequestDTO submitRequest(String userId, GDPRRequestType type, Map<String, Object> details) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (type == null) {
            throw new BusinessException("Request type is required");
        }

        GDPRRequest request = GDPRRequest.builder()
                .user(user)
                .requestType(type)
                .status(GDPRRequestStatus.PENDING)
                .detailsJson(details != null ? details : new HashMap<>())
                .build();

        return toDTO(gdprRequestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public Page<GDPRRequestDTO> getRequests(GDPRRequestStatus status, GDPRRequestType type, Pageable pageable) {
        Specification<GDPRRequest> spec = Specification.where(null);
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("requestType"), type));
        }
        return gdprRequestRepository.findAll(spec, pageable).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<GDPRRequestDTO> getRequestsForUser(String userId, Pageable pageable) {
        return gdprRequestRepository.findByUserId(userId, pageable).map(this::toDTO);
    }

    @Transactional
    public GDPRRequestDTO updateRequest(String adminId, String requestId, GDPRRequestStatus status, String exportUrl) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new BusinessException("Only admins can update GDPR requests");
        }
        if (status == null) {
            throw new BusinessException("Status is required");
        }

        GDPRRequest request = gdprRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("GDPRRequest", requestId));

        request.setStatus(status);
        request.setExportUrl(exportUrl);
        request.setResolvedBy(admin);
        request.setResolvedAt(LocalDateTime.now());

        GDPRRequest updated = gdprRequestRepository.save(request);

        HashMap<String, Object> details = new HashMap<>();
        details.put("status", status != null ? status.name() : null);
        details.put("exportUrl", exportUrl);

        adminAuditService.logAction(
                adminId,
                com.creatorx.common.enums.AdminActionType.SYSTEM_UPDATE,
                "GDPR_REQUEST",
                updated.getId(),
                details,
                null,
                null
        );

        return toDTO(updated);
    }

    private GDPRRequestDTO toDTO(GDPRRequest request) {
        return GDPRRequestDTO.builder()
                .id(request.getId())
                .userId(request.getUser().getId())
                .userEmail(request.getUser().getEmail())
                .requestType(request.getRequestType())
                .status(request.getStatus())
                .details(request.getDetailsJson())
                .exportUrl(request.getExportUrl())
                .resolvedBy(request.getResolvedBy() != null ? request.getResolvedBy().getId() : null)
                .createdAt(request.getCreatedAt())
                .resolvedAt(request.getResolvedAt())
                .build();
    }
}
