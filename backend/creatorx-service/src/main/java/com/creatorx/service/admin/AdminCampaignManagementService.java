package com.creatorx.service.admin;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.enums.CampaignPlatform;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.common.enums.SubmissionStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.CampaignNotFoundException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.ApplicationRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.CampaignTemplateRepository;
import com.creatorx.repository.DeliverableRepository;
import com.creatorx.repository.entity.Application;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.CampaignTemplate;
import com.creatorx.repository.entity.DeliverableSubmission;
import com.creatorx.repository.entity.User;
import com.creatorx.service.ApplicationService;
import com.creatorx.service.CampaignService;
import com.creatorx.service.CampaignTemplateService;
import com.creatorx.service.DeliverableService;
import com.creatorx.service.UserService;
import com.creatorx.service.dto.ApplicationDTO;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.dto.CampaignTemplateDTO;
import com.creatorx.service.dto.DeliverableDTO;
import com.creatorx.service.mapper.CampaignMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminCampaignManagementService {
    private final CampaignRepository campaignRepository;
    private final CampaignTemplateRepository campaignTemplateRepository;
    private final ApplicationRepository applicationRepository;
    private final DeliverableRepository deliverableRepository;
    private final CampaignService campaignService;
    private final CampaignTemplateService campaignTemplateService;
    private final ApplicationService applicationService;
    private final DeliverableService deliverableService;
    private final UserService userService;
    private final CampaignMapper campaignMapper;
    private final AdminAuditService adminAuditService;

    @Transactional(readOnly = true)
    public Page<CampaignDTO> listCampaigns(
            String brandId,
            CampaignStatus status,
            String category,
            CampaignPlatform platform,
            BigDecimal budgetMin,
            BigDecimal budgetMax,
            String search,
            Pageable pageable
    ) {
        return campaignRepository.findAdminCampaigns(
                        brandId,
                        status,
                        category,
                        platform,
                        budgetMin,
                        budgetMax,
                        normalizeSearch(search),
                        pageable
                )
                .map(campaignMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public CampaignDTO getCampaign(String campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new CampaignNotFoundException(campaignId));
        return campaignMapper.toDTO(campaign);
    }

    @Transactional
    public CampaignDTO createCampaign(String adminId, String brandId, CampaignDTO dto) {
        validateBrand(brandId);
        CampaignDTO created = campaignService.createCampaign(dto, brandId);
        logAction(adminId, "CAMPAIGN", created.getId(), "CREATE", Map.of("brandId", brandId));
        return created;
    }

    @Transactional
    public CampaignDTO updateCampaign(String adminId, String campaignId, CampaignDTO dto) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new CampaignNotFoundException(campaignId));
        CampaignDTO updated = campaignService.updateCampaign(campaignId, dto, campaign.getBrand().getId());
        logAction(adminId, "CAMPAIGN", campaignId, "UPDATE", Map.of("brandId", campaign.getBrand().getId()));
        return updated;
    }

    @Transactional
    public void deleteCampaign(String adminId, String campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new CampaignNotFoundException(campaignId));
        campaignService.deleteCampaign(campaignId, campaign.getBrand().getId());
        logAction(adminId, "CAMPAIGN", campaignId, "DELETE", Map.of("brandId", campaign.getBrand().getId()));
    }

    @Transactional
    public ApplicationDTO inviteCreator(String adminId, String campaignId, String creatorId, String message) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new CampaignNotFoundException(campaignId));
        ApplicationDTO application = applicationService.inviteCreator(
                campaign.getBrand().getId(),
                campaignId,
                creatorId,
                message
        );
        logAction(adminId, "CAMPAIGN", campaignId, "INVITE_CREATOR", Map.of(
                "brandId", campaign.getBrand().getId(),
                "creatorId", creatorId
        ));
        return application;
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDTO> getApplications(String campaignId, Pageable pageable) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new CampaignNotFoundException(campaignId));
        return applicationService.getApplicationsByCampaign(campaignId, campaign.getBrand().getId(), pageable);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDTO> listApplications(String brandId, String campaignId, com.creatorx.common.enums.ApplicationStatus status, Pageable pageable) {
        return applicationService.getApplicationsForAdmin(brandId, campaignId, status, pageable);
    }

    @Transactional
    public void shortlistApplication(String adminId, String applicationId) {
        Application application = getApplication(applicationId);
        String brandId = application.getCampaign().getBrand().getId();
        applicationService.shortlistApplication(brandId, applicationId);
        logAction(adminId, "APPLICATION", applicationId, "SHORTLIST_APPLICATION", Map.of(
                "applicationId", applicationId,
                "brandId", brandId,
                "campaignId", application.getCampaign().getId()
        ));
    }

    @Transactional
    public void selectApplication(String adminId, String applicationId) {
        Application application = getApplication(applicationId);
        String brandId = application.getCampaign().getBrand().getId();
        applicationService.selectApplication(brandId, applicationId);
        logAction(adminId, "APPLICATION", applicationId, "SELECT_APPLICATION", Map.of(
                "applicationId", applicationId,
                "brandId", brandId,
                "campaignId", application.getCampaign().getId()
        ));
    }

    @Transactional
    public void rejectApplication(String adminId, String applicationId, String reason) {
        Application application = getApplication(applicationId);
        String brandId = application.getCampaign().getBrand().getId();
        applicationService.rejectApplication(brandId, applicationId, reason);
        logAction(adminId, "APPLICATION", applicationId, "REJECT_APPLICATION", Map.of(
                "applicationId", applicationId,
                "brandId", brandId,
                "reason", reason,
                "campaignId", application.getCampaign().getId()
        ));
    }

    @Transactional
    public void updateApplicationStatus(String adminId, String applicationId, com.creatorx.common.enums.ApplicationStatus status, String reason) {
        Application application = getApplication(applicationId);
        String brandId = application.getCampaign().getBrand().getId();
        applicationService.updateApplicationStatus(brandId, applicationId, status, reason);
        logAction(adminId, "APPLICATION", applicationId, "UPDATE_APPLICATION_STATUS", Map.of(
                "applicationId", applicationId,
                "brandId", brandId,
                "status", status != null ? status.name() : null,
                "reason", reason,
                "campaignId", application.getCampaign().getId()
        ));
    }

    @Transactional
    public void bulkUpdateApplications(String adminId, List<String> applicationIds, com.creatorx.common.enums.ApplicationStatus status, String reason) {
        if (applicationIds == null || applicationIds.isEmpty()) {
            return;
        }
        Application sample = getApplication(applicationIds.get(0));
        String brandId = sample.getCampaign().getBrand().getId();
        applicationService.updateApplicationsStatusBulk(brandId, applicationIds, status, reason);
        logAction(adminId, "APPLICATION", applicationIds.get(0), "BULK_UPDATE_APPLICATIONS", Map.of(
                "brandId", brandId,
                "applicationCount", applicationIds.size(),
                "status", status != null ? status.name() : null,
                "reason", reason,
                "campaignId", sample.getCampaign().getId()
        ));
    }

    @Transactional(readOnly = true)
    public List<DeliverableDTO> getDeliverablesByCampaign(String campaignId, SubmissionStatus status) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new CampaignNotFoundException(campaignId));
        return deliverableService.getDeliverablesByCampaign(campaignId, campaign.getBrand().getId(), status);
    }

    @Transactional(readOnly = true)
    public Page<DeliverableDTO> listDeliverables(String brandId, String campaignId, SubmissionStatus status, Pageable pageable) {
        return deliverableService.getDeliverablesForAdmin(brandId, campaignId, status, pageable);
    }

    @Transactional
    public void reviewDeliverable(String adminId, String submissionId, SubmissionStatus status, String feedback) {
        DeliverableSubmission submission = deliverableRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Deliverable submission", submissionId));
        String brandId = submission.getApplication().getCampaign().getBrand().getId();
        deliverableService.reviewDeliverable(brandId, submissionId, status, feedback);
        logAction(adminId, "DELIVERABLE", submissionId, "REVIEW_DELIVERABLE", Map.of(
                "brandId", brandId,
                "submissionId", submissionId,
                "status", status != null ? status.name() : null,
                "campaignId", submission.getApplication().getCampaign().getId()
        ));
    }

    @Transactional(readOnly = true)
    public List<CampaignTemplateDTO> listTemplates(String brandId) {
        validateBrand(brandId);
        return campaignTemplateService.getTemplates(brandId);
    }

    @Transactional(readOnly = true)
    public CampaignTemplateDTO getTemplate(String templateId) {
        CampaignTemplateDTO template = campaignTemplateService.getTemplate(resolveTemplateBrandId(templateId), templateId);
        return template;
    }

    @Transactional
    public CampaignTemplateDTO createTemplate(String adminId, String brandId, CampaignTemplateDTO dto) {
        validateBrand(brandId);
        CampaignTemplateDTO created = campaignTemplateService.createTemplate(brandId, dto);
        logAction(adminId, "CAMPAIGN_TEMPLATE", created.getId(), "CREATE_TEMPLATE", Map.of("brandId", brandId));
        return created;
    }

    @Transactional
    public CampaignTemplateDTO createTemplateFromCampaign(String adminId, String brandId, String campaignId) {
        validateBrand(brandId);
        CampaignTemplateDTO created = campaignTemplateService.createTemplateFromCampaign(brandId, campaignId);
        logAction(adminId, "CAMPAIGN_TEMPLATE", created.getId(), "CREATE_TEMPLATE_FROM_CAMPAIGN", Map.of(
                "brandId", brandId,
                "templateId", created.getId(),
                "campaignId", campaignId
        ));
        return created;
    }

    @Transactional
    public CampaignTemplateDTO updateTemplate(String adminId, String templateId, CampaignTemplateDTO dto) {
        String brandId = resolveTemplateBrandId(templateId);
        CampaignTemplateDTO updated = campaignTemplateService.updateTemplate(brandId, templateId, dto);
        logAction(adminId, "CAMPAIGN_TEMPLATE", templateId, "UPDATE_TEMPLATE", Map.of("brandId", brandId));
        return updated;
    }

    @Transactional
    public void deleteTemplate(String adminId, String templateId) {
        String brandId = resolveTemplateBrandId(templateId);
        campaignTemplateService.deleteTemplate(brandId, templateId);
        logAction(adminId, "CAMPAIGN_TEMPLATE", templateId, "DELETE_TEMPLATE", Map.of("brandId", brandId));
    }

    private Application getApplication(String applicationId) {
        return applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));
    }

    private void validateBrand(String brandId) {
        User brand = userService.findById(brandId);
        if (brand.getRole() != UserRole.BRAND) {
            throw new BusinessException("Target user must be a brand");
        }
    }

    private String resolveTemplateBrandId(String templateId) {
        CampaignTemplate template = campaignTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("CampaignTemplate", templateId));
        return template.getBrand().getId();
    }

    private void logAction(String adminId, String entityType, String entityId, String action, Map<String, Object> baseDetails) {
        HashMap<String, Object> details = new HashMap<>();
        if (baseDetails != null) {
            details.putAll(baseDetails);
        }
        details.put("action", action);
        adminAuditService.logAction(
                adminId,
                AdminActionType.SYSTEM_UPDATE,
                entityType,
                entityId,
                details,
                null,
                null
        );
    }

    private String normalizeSearch(String search) {
        if (search == null || search.trim().isEmpty()) {
            return null;
        }
        return search.trim();
    }
}
