package com.creatorx.service.admin;

import com.creatorx.common.enums.AdminActionType;
import com.creatorx.common.enums.CampaignStatus;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.CampaignDTO;
import com.creatorx.service.mapper.CampaignMapper;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminCampaignReviewService Unit Tests")
class AdminCampaignReviewServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CampaignMapper campaignMapper;

    @Mock
    private AdminAuditService adminAuditService;

    @Mock
    private ModerationService moderationService;

    @InjectMocks
    private AdminCampaignReviewService adminCampaignReviewService;

    @Test
    @DisplayName("Should escalate pending campaign without approving or rejecting it")
    void escalateCampaign_keepsPendingAndCreatesModerationFlag() {
        User admin = TestDataBuilder.user()
                .withId("admin-1")
                .asAdmin()
                .build();
        Campaign campaign = TestDataBuilder.campaign()
                .withId("campaign-1")
                .withStatus(CampaignStatus.PENDING_REVIEW)
                .build();
        CampaignDTO dto = CampaignDTO.builder()
                .id(campaign.getId())
                .status(CampaignStatus.PENDING_REVIEW)
                .reviewReason("Escalated: Needs compliance review")
                .build();

        when(campaignRepository.findById("campaign-1")).thenReturn(Optional.of(campaign));
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
        when(campaignRepository.save(any(Campaign.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(campaignMapper.toDTO(any(Campaign.class))).thenReturn(dto);

        CampaignDTO result = adminCampaignReviewService.escalateCampaign(
                "admin-1",
                "campaign-1",
                "Needs compliance review"
        );

        ArgumentCaptor<Campaign> campaignCaptor = ArgumentCaptor.forClass(Campaign.class);
        verify(campaignRepository).save(campaignCaptor.capture());
        Campaign saved = campaignCaptor.getValue();

        assertThat(saved.getStatus()).isEqualTo(CampaignStatus.PENDING_REVIEW);
        assertThat(saved.getReviewedBy()).isEqualTo(admin);
        assertThat(saved.getReviewReason()).isEqualTo("Escalated: Needs compliance review");
        assertThat(result.getReviewReason()).isEqualTo("Escalated: Needs compliance review");

        verify(moderationService).flagCampaign(
                "campaign-1",
                null,
                "Pre-approval escalated: Needs compliance review",
                "admin-1"
        );
        verify(adminAuditService).logAction(
                eq("admin-1"),
                eq(AdminActionType.SYSTEM_UPDATE),
                eq("CAMPAIGN"),
                eq("campaign-1"),
                argThat((Map<String, Object> details) ->
                        "CAMPAIGN_ESCALATED".equals(details.get("action"))
                                && "Needs compliance review".equals(details.get("reason"))),
                eq(null),
                eq(null)
        );
    }
}
