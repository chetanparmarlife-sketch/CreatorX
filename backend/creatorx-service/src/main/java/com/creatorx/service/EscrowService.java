package com.creatorx.service;

import com.creatorx.common.enums.PaymentOrderStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.repository.EscrowTransactionRepository;
import com.creatorx.repository.PaymentOrderRepository;
import com.creatorx.repository.entity.PaymentOrder;
import com.creatorx.service.dto.EscrowBalanceDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for managing brand escrow funds.
 * Escrow holds brand deposits until they're released to creators upon deliverable approval.
 *
 * Balance is computed from the escrow transaction audit trail:
 * - Deposits add to total deposited
 * - Allocations subtract from available balance (committed to campaigns)
 * - Releases subtract from available balance (paid to creators)
 * - Refunds add back to available balance (unused campaign funds returned)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EscrowService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final EscrowTransactionRepository escrowTransactionRepository;
    private final WalletService walletService;

    /**
     * Record a brand deposit into escrow.
     * Called when a brand payment is captured via webhook.
     */
    @Transactional
    public void creditBrandDeposit(PaymentOrder paymentOrder) {
        if (paymentOrder.getStatus() != PaymentOrderStatus.CAPTURED) {
            throw new BusinessException("Cannot credit escrow for non-captured payment");
        }

        String brandId = paymentOrder.getBrand().getId();
        String campaignId = paymentOrder.getCampaign() != null ? paymentOrder.getCampaign().getId() : null;
        BigDecimal amount = paymentOrder.getAmount();

        log.info("Escrow credited: brand={}, campaign={}, amount={} INR, paymentOrder={}",
                brandId, campaignId, amount, paymentOrder.getId());

        // The PaymentOrder record itself serves as the escrow record
        // No additional tracking needed - we query captured payments to get escrow balance
    }

    /**
     * Get escrow balance for a brand.
     * available = deposited - allocated - released + refunded
     */
    @Transactional(readOnly = true)
    public EscrowBalanceDTO getEscrowBalance(String brandId) {
        BigDecimal totalDeposited = paymentOrderRepository.sumCapturedAmountByBrandId(brandId);
        if (totalDeposited == null) {
            totalDeposited = BigDecimal.ZERO;
        }

        BigDecimal allocatedAmount = escrowTransactionRepository.sumAllocatedAmountByBrandId(brandId);
        BigDecimal releasedAmount = escrowTransactionRepository.sumReleasedAmountByBrandId(brandId);
        BigDecimal refundedAmount = escrowTransactionRepository.sumRefundedAmountByBrandId(brandId);

        // available = deposited - allocated + refunded
        // (released funds come out of allocated, not directly from deposited)
        BigDecimal availableBalance = totalDeposited
                .subtract(allocatedAmount)
                .add(refundedAmount);

        return EscrowBalanceDTO.builder()
                .brandId(brandId)
                .totalDeposited(totalDeposited)
                .allocatedAmount(allocatedAmount)
                .availableBalance(availableBalance)
                .releasedAmount(releasedAmount)
                .build();
    }

    /**
     * Get escrow balance for a specific campaign.
     * available = allocated - released
     */
    @Transactional(readOnly = true)
    public EscrowBalanceDTO getCampaignEscrowBalance(String campaignId) {
        BigDecimal totalDeposited = paymentOrderRepository.sumCapturedAmountByCampaignId(campaignId);
        if (totalDeposited == null) {
            totalDeposited = BigDecimal.ZERO;
        }

        BigDecimal allocatedAmount = escrowTransactionRepository.sumAllocatedAmountByCampaignId(campaignId);
        BigDecimal releasedAmount = escrowTransactionRepository.sumReleasedAmountByCampaignId(campaignId);

        BigDecimal availableBalance = allocatedAmount.subtract(releasedAmount);

        return EscrowBalanceDTO.builder()
                .campaignId(campaignId)
                .totalDeposited(totalDeposited)
                .allocatedAmount(allocatedAmount)
                .availableBalance(availableBalance)
                .releasedAmount(releasedAmount)
                .build();
    }

    /**
     * Release funds from escrow to a creator.
     * Called when a deliverable is approved.
     *
     * @param brandId    Brand who funded the campaign
     * @param creatorId  Creator to receive payment
     * @param campaignId Campaign for tracking
     * @param amount     Amount to release
     * @param reason     Reason for release (e.g., "Deliverable approved")
     */
    @Transactional
    public void releaseToCreator(String brandId, String creatorId, String campaignId,
                                  BigDecimal amount, String reason) {
        // Verify sufficient escrow balance
        EscrowBalanceDTO balance = campaignId != null
                ? getCampaignEscrowBalance(campaignId)
                : getEscrowBalance(brandId);

        if (balance.getAvailableBalance().compareTo(amount) < 0) {
            throw new BusinessException("Insufficient escrow balance. Available: " + balance.getAvailableBalance());
        }

        // Credit creator's wallet
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("brandId", brandId);
        metadata.put("campaignId", campaignId);
        metadata.put("source", "escrow_release");

        walletService.creditWallet(creatorId, amount, reason, campaignId);

        log.info("Escrow released: brand={}, creator={}, campaign={}, amount={} INR",
                brandId, creatorId, campaignId, amount);
    }
}
