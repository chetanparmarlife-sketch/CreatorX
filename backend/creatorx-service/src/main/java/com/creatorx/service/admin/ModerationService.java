package com.creatorx.service.admin;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.enums.CampaignFlagStatus;
import com.creatorx.common.enums.ModerationRuleStatus;
import com.creatorx.common.enums.UserRole;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.CampaignFlagRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.ModerationRuleRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.CampaignFlag;
import com.creatorx.repository.entity.ModerationRule;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.CampaignFlagDTO;
import com.creatorx.service.dto.ModerationRuleDTO;
import com.creatorx.service.dto.ModerationRuleTestResultDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

@Service
@RequiredArgsConstructor
public class ModerationService {
    private final ModerationRuleRepository moderationRuleRepository;
    private final CampaignFlagRepository campaignFlagRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final AdminAuditService adminAuditService;

    @Transactional(readOnly = true)
    public List<ModerationRuleDTO> getRules() {
        return moderationRuleRepository.findAll().stream()
                .map(this::enrichRuleDTO)
                .toList();
    }

    @Transactional
    public ModerationRuleDTO createRule(ModerationRuleDTO request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BusinessException("Rule name is required");
        }
        if (request.getPattern() == null || request.getPattern().isBlank()) {
            throw new BusinessException("Rule pattern is required");
        }
        ModerationRule rule = ModerationRule.builder()
                .name(request.getName())
                .description(request.getDescription())
                .pattern(request.getPattern())
                .action(request.getAction() != null ? request.getAction() : "FLAG")
                .severity(request.getSeverity())
                .status(request.getStatus() != null ? request.getStatus() : ModerationRuleStatus.ACTIVE)
                .build();
        return enrichRuleDTO(moderationRuleRepository.save(rule));
    }

    @Transactional
    public ModerationRuleDTO updateRule(String ruleId, ModerationRuleDTO request) {
        ModerationRule rule = moderationRuleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("ModerationRule", ruleId));

        if (request.getName() != null) rule.setName(request.getName());
        if (request.getDescription() != null) rule.setDescription(request.getDescription());
        if (request.getPattern() != null) rule.setPattern(request.getPattern());
        if (request.getAction() != null) rule.setAction(request.getAction());
        if (request.getSeverity() != null) rule.setSeverity(request.getSeverity());
        if (request.getStatus() != null) rule.setStatus(request.getStatus());

        return enrichRuleDTO(moderationRuleRepository.save(rule));
    }

    @Transactional
    public void deleteRule(String ruleId) {
        if (!moderationRuleRepository.existsById(ruleId)) {
            throw new ResourceNotFoundException("ModerationRule", ruleId);
        }
        moderationRuleRepository.deleteById(ruleId);
    }

    @Transactional
    public CampaignFlagDTO flagCampaign(String campaignId, String ruleId, String reason, String flaggedById) {
        if (reason == null || reason.isBlank()) {
            throw new BusinessException("Reason is required");
        }
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));

        ModerationRule rule = null;
        if (ruleId != null) {
            rule = moderationRuleRepository.findById(ruleId)
                    .orElseThrow(() -> new ResourceNotFoundException("ModerationRule", ruleId));
        }

        User flaggedBy = null;
        if (flaggedById != null) {
            flaggedBy = userRepository.findById(flaggedById)
                    .orElseThrow(() -> new ResourceNotFoundException("User", flaggedById));
        }

        CampaignFlag flag = CampaignFlag.builder()
                .campaign(campaign)
                .rule(rule)
                .reason(reason)
                .status(CampaignFlagStatus.OPEN)
                .flaggedBy(flaggedBy)
                .build();

        return toFlagDTO(campaignFlagRepository.save(flag));
    }

    @Transactional(readOnly = true)
    public Page<CampaignFlagDTO> getFlags(CampaignFlagStatus status, Pageable pageable) {
        if (status == null) {
            return campaignFlagRepository.findAll(pageable).map(this::toFlagDTO);
        }
        return campaignFlagRepository.findByStatus(status, pageable).map(this::toFlagDTO);
    }

    @Transactional
    public CampaignFlagDTO resolveFlag(String adminId, String flagId, CampaignFlagStatus status, String notes, boolean removeCampaign) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", adminId));
        if (admin.getRole() != UserRole.ADMIN) {
            throw new BusinessException("Only admins can resolve flags");
        }

        CampaignFlag flag = campaignFlagRepository.findById(flagId)
                .orElseThrow(() -> new ResourceNotFoundException("CampaignFlag", flagId));

        flag.setStatus(status != null ? status : CampaignFlagStatus.RESOLVED);
        flag.setResolvedBy(admin);
        flag.setResolvedAt(LocalDateTime.now());
        flag.setResolutionNotes(notes);

        CampaignFlag updated = campaignFlagRepository.save(flag);

        if (removeCampaign) {
            Campaign campaign = flag.getCampaign();
            campaign.setStatus(com.creatorx.common.enums.CampaignStatus.CANCELLED);
            campaignRepository.save(campaign);
        }

        HashMap<String, Object> details = new HashMap<>();
        details.put("status", updated.getStatus().name());
        details.put("notes", notes);
        details.put("removed", removeCampaign);

        adminAuditService.logAction(
                adminId,
                AdminActionType.CAMPAIGN_REJECTED,
                "CAMPAIGN_FLAG",
                updated.getId(),
                details,
                null,
                null
        );

        return toFlagDTO(updated);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void evaluateCampaign(Campaign campaign, User flaggedBy) {
        List<ModerationRule> rules = moderationRuleRepository.findByStatus(ModerationRuleStatus.ACTIVE);
        if (rules.isEmpty()) {
            return;
        }

        StringBuilder content = new StringBuilder();
        if (campaign.getTitle() != null) content.append(campaign.getTitle()).append(' ');
        if (campaign.getDescription() != null) content.append(campaign.getDescription()).append(' ');
        if (campaign.getRequirements() != null) content.append(campaign.getRequirements()).append(' ');
        if (campaign.getTags() != null) content.append(String.join(" ", campaign.getTags()));

        String text = content.toString();

        for (ModerationRule rule : rules) {
            if (rule.getPattern() == null || rule.getPattern().isBlank()) {
                continue;
            }
            boolean matched = false;
            try {
                matched = Pattern.compile(rule.getPattern(), Pattern.CASE_INSENSITIVE)
                        .matcher(text)
                        .find();
            } catch (PatternSyntaxException ignored) {
                matched = text.toLowerCase().contains(rule.getPattern().toLowerCase());
            }

            if (matched && !campaignFlagRepository.existsByCampaignIdAndRuleIdAndStatus(
                    campaign.getId(),
                    rule.getId(),
                    CampaignFlagStatus.OPEN
            )) {
                CampaignFlag flag = CampaignFlag.builder()
                        .campaign(campaign)
                        .rule(rule)
                        .reason("Matched rule: " + rule.getName())
                        .status(CampaignFlagStatus.OPEN)
                        .flaggedBy(flaggedBy)
                        .build();
                campaignFlagRepository.save(flag);
            }
        }
    }

    private CampaignFlagDTO toFlagDTO(CampaignFlag flag) {
        return CampaignFlagDTO.builder()
                .id(flag.getId())
                .campaignId(flag.getCampaign().getId())
                .campaignTitle(flag.getCampaign().getTitle())
                .ruleId(flag.getRule() != null ? flag.getRule().getId() : null)
                .ruleName(flag.getRule() != null ? flag.getRule().getName() : null)
                .ruleSeverity(flag.getRule() != null && flag.getRule().getSeverity() != null
                        ? flag.getRule().getSeverity().name()
                        : null)
                .status(flag.getStatus())
                .reason(flag.getReason())
                .flaggedBy(flag.getFlaggedBy() != null ? flag.getFlaggedBy().getId() : null)
                .flaggedAt(flag.getCreatedAt())
                .resolvedBy(flag.getResolvedBy() != null ? flag.getResolvedBy().getId() : null)
                .resolvedAt(flag.getResolvedAt())
                .resolutionNotes(flag.getResolutionNotes())
                .build();
    }

    @Transactional(readOnly = true)
    public ModerationRuleTestResultDTO testRule(String ruleId, int sampleSize) {
        ModerationRule rule = moderationRuleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("ModerationRule", ruleId));
        if (sampleSize < 1) {
            throw new BusinessException("Sample size must be greater than 0");
        }

        List<Campaign> campaigns = campaignRepository.findAll(
                org.springframework.data.domain.PageRequest.of(
                        0,
                        Math.min(sampleSize, 200),
                        org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
                )
        ).getContent();

        String pattern = rule.getPattern();
        if (pattern == null || pattern.isBlank()) {
            throw new BusinessException("Rule pattern is required");
        }

        List<ModerationRuleTestResultDTO.MatchedCampaign> matches = new ArrayList<>();
        int tested = 0;
        for (Campaign campaign : campaigns) {
            tested += 1;
            StringBuilder content = new StringBuilder();
            if (campaign.getTitle() != null) content.append(campaign.getTitle()).append(' ');
            if (campaign.getDescription() != null) content.append(campaign.getDescription()).append(' ');
            if (campaign.getRequirements() != null) content.append(campaign.getRequirements()).append(' ');
            if (campaign.getTags() != null) content.append(String.join(" ", campaign.getTags()));
            String text = content.toString();

            boolean matched;
            try {
                matched = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE)
                        .matcher(text)
                        .find();
            } catch (PatternSyntaxException ignored) {
                matched = text.toLowerCase().contains(pattern.toLowerCase());
            }

            if (matched) {
                matches.add(ModerationRuleTestResultDTO.MatchedCampaign.builder()
                        .campaignId(campaign.getId())
                        .campaignTitle(campaign.getTitle())
                        .build());
            }
        }

        return ModerationRuleTestResultDTO.builder()
                .ruleId(ruleId)
                .testedCount(tested)
                .matchCount(matches.size())
                .matches(matches)
                .build();
    }

    private ModerationRuleDTO enrichRuleDTO(ModerationRule rule) {
        CampaignFlag lastFlag = campaignFlagRepository.findTopByRuleIdOrderByCreatedAtDesc(rule.getId());
        return ModerationRuleDTO.builder()
                .id(rule.getId())
                .name(rule.getName())
                .description(rule.getDescription())
                .pattern(rule.getPattern())
                .action(rule.getAction())
                .severity(rule.getSeverity())
                .status(rule.getStatus())
                .createdAt(rule.getCreatedAt())
                .totalFlags(campaignFlagRepository.countByRuleId(rule.getId()))
                .openFlags(campaignFlagRepository.countByRuleIdAndStatus(rule.getId(), CampaignFlagStatus.OPEN))
                .lastTriggeredAt(lastFlag != null ? lastFlag.getCreatedAt() : null)
                .build();
    }
}
