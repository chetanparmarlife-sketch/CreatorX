package com.creatorx.service.admin;

import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.AdminFeedbackRepository;
import com.creatorx.repository.AdminSessionEventRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.AdminFeedback;
import com.creatorx.repository.entity.AdminSessionEvent;
import com.creatorx.repository.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminEngagementService {
    private final UserRepository userRepository;
    private final AdminSessionEventRepository adminSessionEventRepository;
    private final AdminFeedbackRepository adminFeedbackRepository;

    @Transactional
    public void recordSessionEvent(String adminId, String eventType, String path) {
        User admin = requireAdmin(adminId);
        String normalizedEventType = eventType != null && !eventType.isBlank()
                ? eventType.trim().toUpperCase()
                : "PAGE_VIEW";

        AdminSessionEvent event = AdminSessionEvent.builder()
                .admin(admin)
                .eventType(normalizedEventType)
                .path(path)
                .occurredAt(LocalDateTime.now())
                .build();

        adminSessionEventRepository.save(event);
    }

    @Transactional
    public void submitFeedback(String adminId, int rating, String comment) {
        User admin = requireAdmin(adminId);
        if (rating < 1 || rating > 5) {
            throw new BusinessException("Rating must be between 1 and 5");
        }

        AdminFeedback feedback = AdminFeedback.builder()
                .admin(admin)
                .rating(rating)
                .comment(comment != null && !comment.isBlank() ? comment.trim() : null)
                .build();

        adminFeedbackRepository.save(feedback);
    }

    private User requireAdmin(String adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new BusinessException("Only admins can perform this action");
        }
        return admin;
    }
}
