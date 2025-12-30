package com.creatorx.service.admin;

import com.creatorx.common.enums.AppealStatus;
import com.creatorx.common.enums.CampaignFlagStatus;
import com.creatorx.common.enums.DisputeStatus;
import com.creatorx.common.enums.DocumentStatus;
import com.creatorx.common.enums.GDPRRequestStatus;
import com.creatorx.repository.*;
import com.creatorx.service.dto.AdminSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminSystemService {
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final KYCDocumentRepository kycDocumentRepository;
    private final BrandVerificationDocumentRepository brandVerificationDocumentRepository;
    private final DisputeRepository disputeRepository;
    private final CampaignFlagRepository campaignFlagRepository;
    private final AccountAppealRepository accountAppealRepository;
    private final GDPRRequestRepository gdprRequestRepository;

    @Transactional(readOnly = true)
    public AdminSummaryDTO getSummary() {
        return AdminSummaryDTO.builder()
                .totalUsers(userRepository.count())
                .totalCampaigns(campaignRepository.count())
                .pendingKyc(kycDocumentRepository.countByStatus(DocumentStatus.PENDING))
                .pendingBrandVerifications(brandVerificationDocumentRepository.countByStatus("PENDING"))
                .openDisputes(disputeRepository.countByStatus(DisputeStatus.OPEN))
                .openCampaignFlags(campaignFlagRepository.countByStatus(CampaignFlagStatus.OPEN))
                .openAppeals(accountAppealRepository.countByStatus(AppealStatus.OPEN))
                .pendingGdprRequests(gdprRequestRepository.countByStatus(GDPRRequestStatus.PENDING))
                .build();
    }
}
