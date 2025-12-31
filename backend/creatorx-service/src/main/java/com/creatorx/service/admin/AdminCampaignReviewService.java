package com.creatorx.service.admin;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.mapper.CampaignMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AdminCampaignReviewService {
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final CampaignMapper campaignMapper;
    private final AdminAuditService adminAuditService;
    private final ModerationService moderationService;

    @Transactional(readOnly = true)
    public Page<CampaignDTO> listPending(Pageable pageable) {
        return campaignRepository.findByStatus(CampaignStatus.PENDING_REVIEW, pageable)
                .map(campaignMapper::toDTO);
    }

    @Transactional
    public CampaignDTO approveCampaign(String adminId, String campaignId) {
        Campaign campaign = getPendingCampaign(campaignId);
        User admin = requireAdmin(adminId);

        campaign.setStatus(CampaignStatus.ACTIVE);
        campaign.setReviewedBy(admin);
        campaign.setReviewedAt(LocalDateTime.now());
        campaign.setReviewReason(null);

        Campaign saved = campaignRepository.save(campaign);

        adminAuditService.logAction(
                adminId,
                AdminActionType.CAMPAIGN_APPROVED,
                "CAMPAIGN",
                campaignId,
                new HashMap<>(),
                null,
                null
        );

        return campaignMapper.toDTO(saved);
    }

    @Transactional
    public CampaignDTO rejectCampaign(String adminId, String campaignId, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new BusinessException("Rejection reason is required");
        }
        Campaign campaign = getPendingCampaign(campaignId);
        User admin = requireAdmin(adminId);

        campaign.setStatus(CampaignStatus.DRAFT);
        campaign.setReviewedBy(admin);
        campaign.setReviewedAt(LocalDateTime.now());
        campaign.setReviewReason(reason);

        Campaign saved = campaignRepository.save(campaign);

        moderationService.flagCampaign(campaignId, null, "Pre-approval rejected: " + reason, adminId);

        HashMap<String, Object> details = new HashMap<>();
        details.put("reason", reason);

        adminAuditService.logAction(
                adminId,
                AdminActionType.CAMPAIGN_REJECTED,
                "CAMPAIGN",
                campaignId,
                details,
                null,
                null
        );

        return campaignMapper.toDTO(saved);
    }

    private Campaign getPendingCampaign(String campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));
        if (campaign.getStatus() != CampaignStatus.PENDING_REVIEW) {
            throw new BusinessException("Campaign is not pending review");
        }
        return campaign;
    }

    private User requireAdmin(String adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new BusinessException("Only admins can review campaigns");
        }
        return admin;
    }
}
