package com.creatorx.service;

import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.CampaignTemplateRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.CampaignDeliverable;
import com.creatorx.repository.entity.CampaignTemplate;
import com.creatorx.repository.entity.CampaignTemplateDeliverable;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.CampaignTemplateDTO;
import com.creatorx.service.dto.CampaignTemplateDeliverableDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CampaignTemplateService {
    private final CampaignTemplateRepository templateRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CampaignTemplateDTO> getTemplates(String brandId) {
        return templateRepository.findByBrandId(brandId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CampaignTemplateDTO getTemplate(String brandId, String templateId) {
        CampaignTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("CampaignTemplate", templateId));

        if (!template.getBrand().getId().equals(brandId)) {
            throw new BusinessException("You can only access your own templates");
        }

        return toDTO(template);
    }

    @Transactional
    public CampaignTemplateDTO createTemplate(String brandId, CampaignTemplateDTO dto) {
        User brand = userRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("User", brandId));

        CampaignTemplate template = CampaignTemplate.builder()
                .brand(brand)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .budget(dto.getBudget())
                .platform(dto.getPlatform())
                .category(dto.getCategory())
                .requirements(dto.getRequirements())
                .deliverableTypes(dto.getDeliverableTypes())
                .tags(dto.getTags())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .applicationDeadline(dto.getApplicationDeadline())
                .maxApplicants(dto.getMaxApplicants())
                .build();

        if (dto.getDeliverables() != null) {
            List<CampaignTemplateDeliverable> deliverables = dto.getDeliverables().stream()
                    .map(item -> CampaignTemplateDeliverable.builder()
                            .template(template)
                            .title(item.getTitle())
                            .description(item.getDescription())
                            .type(item.getType())
                            .dueDate(item.getDueDate())
                            .isMandatory(item.getIsMandatory() != null ? item.getIsMandatory() : true)
                            .orderIndex(item.getOrderIndex())
                            .build())
                    .collect(Collectors.toList());
            template.setDeliverables(deliverables);
        }

        CampaignTemplate saved = templateRepository.save(template);
        return toDTO(saved);
    }

    @Transactional
    public CampaignTemplateDTO createTemplateFromCampaign(String brandId, String campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));

        if (!campaign.getBrand().getId().equals(brandId)) {
            throw new BusinessException("You can only template your own campaigns");
        }

        CampaignTemplate template = CampaignTemplate.builder()
                .brand(campaign.getBrand())
                .title(campaign.getTitle())
                .description(campaign.getDescription())
                .budget(campaign.getBudget())
                .platform(campaign.getPlatform())
                .category(campaign.getCategory())
                .requirements(campaign.getRequirements())
                .deliverableTypes(campaign.getDeliverableTypes())
                .tags(campaign.getTags())
                .startDate(campaign.getStartDate())
                .endDate(campaign.getEndDate())
                .applicationDeadline(campaign.getApplicationDeadline())
                .maxApplicants(campaign.getMaxApplicants())
                .build();

        if (campaign.getCampaignDeliverables() != null) {
            List<CampaignTemplateDeliverable> deliverables = campaign.getCampaignDeliverables().stream()
                    .map((deliverable) -> CampaignTemplateDeliverable.builder()
                            .template(template)
                            .title(deliverable.getTitle())
                            .description(deliverable.getDescription())
                            .type(deliverable.getType() != null ? deliverable.getType().name() : null)
                            .dueDate(deliverable.getDueDate())
                            .isMandatory(deliverable.getIsMandatory())
                            .orderIndex(deliverable.getOrderIndex())
                            .build())
                    .collect(Collectors.toList());
            template.setDeliverables(deliverables);
        }

        CampaignTemplate saved = templateRepository.save(template);
        log.info("Campaign template created from campaign {} for brand {}", campaignId, brandId);
        return toDTO(saved);
    }

    @Transactional
    public CampaignTemplateDTO updateTemplate(String brandId, String templateId, CampaignTemplateDTO dto) {
        CampaignTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("CampaignTemplate", templateId));

        if (!template.getBrand().getId().equals(brandId)) {
            throw new BusinessException("You can only update your own templates");
        }

        if (dto.getTitle() != null) template.setTitle(dto.getTitle());
        if (dto.getDescription() != null) template.setDescription(dto.getDescription());
        if (dto.getBudget() != null) template.setBudget(dto.getBudget());
        if (dto.getPlatform() != null) template.setPlatform(dto.getPlatform());
        if (dto.getCategory() != null) template.setCategory(dto.getCategory());
        if (dto.getRequirements() != null) template.setRequirements(dto.getRequirements());
        if (dto.getDeliverableTypes() != null) template.setDeliverableTypes(dto.getDeliverableTypes());
        if (dto.getTags() != null) template.setTags(dto.getTags());
        if (dto.getStartDate() != null) template.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) template.setEndDate(dto.getEndDate());
        if (dto.getApplicationDeadline() != null) template.setApplicationDeadline(dto.getApplicationDeadline());
        if (dto.getMaxApplicants() != null) template.setMaxApplicants(dto.getMaxApplicants());

        if (dto.getDeliverables() != null) {
            template.getDeliverables().clear();
            List<CampaignTemplateDeliverable> deliverables = dto.getDeliverables().stream()
                    .map(item -> CampaignTemplateDeliverable.builder()
                            .template(template)
                            .title(item.getTitle())
                            .description(item.getDescription())
                            .type(item.getType())
                            .dueDate(item.getDueDate())
                            .isMandatory(item.getIsMandatory() != null ? item.getIsMandatory() : true)
                            .orderIndex(item.getOrderIndex())
                            .build())
                    .collect(Collectors.toList());
            template.setDeliverables(deliverables);
        }

        CampaignTemplate saved = templateRepository.save(template);
        return toDTO(saved);
    }

    @Transactional
    public void deleteTemplate(String brandId, String templateId) {
        CampaignTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("CampaignTemplate", templateId));

        if (!template.getBrand().getId().equals(brandId)) {
            throw new BusinessException("You can only delete your own templates");
        }

        templateRepository.delete(template);
    }

    private CampaignTemplateDTO toDTO(CampaignTemplate template) {
        List<CampaignTemplateDeliverableDTO> deliverables = template.getDeliverables()
                .stream()
                .sorted(Comparator.comparing((CampaignTemplateDeliverable item) ->
                        item.getOrderIndex() == null ? 0 : item.getOrderIndex()))
                .map(item -> CampaignTemplateDeliverableDTO.builder()
                        .id(item.getId())
                        .title(item.getTitle())
                        .description(item.getDescription())
                        .type(item.getType())
                        .dueDate(item.getDueDate())
                        .isMandatory(item.getIsMandatory())
                        .orderIndex(item.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        return CampaignTemplateDTO.builder()
                .id(template.getId())
                .brandId(template.getBrand().getId())
                .title(template.getTitle())
                .description(template.getDescription())
                .budget(template.getBudget())
                .platform(template.getPlatform())
                .category(template.getCategory())
                .requirements(template.getRequirements())
                .deliverableTypes(template.getDeliverableTypes())
                .tags(template.getTags())
                .startDate(template.getStartDate())
                .endDate(template.getEndDate())
                .applicationDeadline(template.getApplicationDeadline())
                .maxApplicants(template.getMaxApplicants())
                .deliverables(deliverables)
                .build();
    }
}
