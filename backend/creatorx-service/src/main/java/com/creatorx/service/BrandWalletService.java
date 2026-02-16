package com.creatorx.service;

import com.creatorx.common.enums.EscrowTransactionType;
import com.creatorx.common.enums.PaymentOrderStatus;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.BrandWalletRepository;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.EscrowTransactionRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.BrandWallet;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.EscrowTransaction;
import com.creatorx.repository.entity.PaymentOrder;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.BrandWalletDTO;
import com.creatorx.service.dto.EscrowTransactionDTO;
import com.creatorx.service.dto.PaymentOrderDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service for brand wallet and escrow management
 * Handles deposits, allocations, releases, and refunds
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BrandWalletService {

    private final BrandWalletRepository brandWalletRepository;
    private final EscrowTransactionRepository escrowTransactionRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final PaymentCollectionService paymentCollectionService;
    private final WalletService walletService;

    /**
     * Get brand wallet balance and stats
     */
    @Transactional(readOnly = true)
    public BrandWalletDTO getWallet(String brandId) {
        BrandWallet wallet = brandWalletRepository.findByBrandId(brandId)
                .orElseGet(() -> createWallet(brandId));

        return BrandWalletDTO.builder()
                .brandId(brandId)
                .balance(wallet.getBalance())
                .totalDeposited(wallet.getTotalDeposited())
                .totalAllocated(wallet.getTotalAllocated())
                .totalReleased(wallet.getTotalReleased())
                .currency(wallet.getCurrency())
                .build();
    }

    /**
     * Create payment order to deposit funds into wallet
     * Called from brand dashboard when adding funds
     */
    @Transactional
    public PaymentOrderDTO createDepositOrder(String brandId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Deposit amount must be greater than zero");
        }

        // Minimum deposit check
        BigDecimal minDeposit = new BigDecimal("1000");
        if (amount.compareTo(minDeposit) < 0) {
            throw new BusinessException("Minimum deposit amount is ₹" + minDeposit);
        }

        // Create Razorpay payment order (no campaign - this is for wallet)
        PaymentOrderDTO order = paymentCollectionService.createPaymentOrder(
                brandId,
                null, // No campaign for wallet deposits
                amount,
                UUID.randomUUID().toString()
        );

        log.info("Wallet deposit order created: brand={}, amount={}, order={}",
                 brandId, amount, order.getId());
        return order;
    }

    /**
     * Credit wallet when payment is captured
     * Called from webhook handler: payment.captured
     */
    @Transactional
    public void creditWalletFromPayment(PaymentOrder paymentOrder) {
        // Only process wallet deposits (campaign_id is null)
        if (paymentOrder.getCampaign() != null) {
            log.debug("Payment order has campaign, not a wallet deposit: {}", paymentOrder.getId());
            return;
        }

        if (paymentOrder.getStatus() != PaymentOrderStatus.CAPTURED) {
            throw new BusinessException("Cannot credit wallet for non-captured payment");
        }

        String brandId = paymentOrder.getBrand().getId();
        BigDecimal amount = paymentOrder.getAmount();

        // Lock wallet for update
        BrandWallet wallet = brandWalletRepository.findByBrandIdWithLock(brandId)
                .orElseGet(() -> createWallet(brandId));

        BigDecimal balanceBefore = wallet.getBalance();

        // Credit wallet
        wallet.creditDeposit(amount);
        brandWalletRepository.save(wallet);

        // Record transaction
        createEscrowTransaction(
                brandId,
                null,
                paymentOrder.getId(),
                EscrowTransactionType.DEPOSIT,
                amount,
                balanceBefore,
                wallet.getBalance(),
                "Wallet deposit via Razorpay: " + paymentOrder.getRazorpayPaymentId(),
                Map.of(
                        "razorpayPaymentId", paymentOrder.getRazorpayPaymentId(),
                        "razorpayOrderId", paymentOrder.getRazorpayOrderId(),
                        "paymentMethod", paymentOrder.getPaymentMethod() != null ? paymentOrder.getPaymentMethod() : "unknown"
                )
        );

        log.info("Wallet credited from payment: brand={}, amount={}, newBalance={}, paymentOrder={}",
                brandId, amount, wallet.getBalance(), paymentOrder.getId());
    }

    /**
     * Allocate funds from wallet to campaign
     * Called when brand funds a campaign
     */
    @Transactional
    public void allocateToCampaign(String brandId, String campaignId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Allocation amount must be greater than zero");
        }

        // Lock wallet
        BrandWallet wallet = brandWalletRepository.findByBrandIdWithLock(brandId)
                .orElseThrow(() -> new BusinessException("Wallet not found. Please deposit funds first."));

        // Check sufficient balance
        if (!wallet.hasSufficientBalance(amount)) {
            throw new BusinessException(
                    "Insufficient wallet balance. Available: ₹" + wallet.getBalance() +
                            ", Required: ₹" + amount
            );
        }

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));

        // Verify ownership
        if (!campaign.getBrand().getId().equals(brandId)) {
            throw new BusinessException("Campaign does not belong to this brand");
        }

        // Check allocation doesn't exceed budget
        BigDecimal newAllocated = campaign.getEscrowAllocated().add(amount);
        if (newAllocated.compareTo(campaign.getBudget()) > 0) {
            throw new BusinessException(
                    "Allocation exceeds campaign budget. Budget: ₹" + campaign.getBudget() +
                            ", Current: ₹" + campaign.getEscrowAllocated() +
                            ", Requested: ₹" + amount
            );
        }

        BigDecimal balanceBefore = wallet.getBalance();

        // Debit wallet
        wallet.allocateToCampaign(amount);
        brandWalletRepository.save(wallet);

        // Credit campaign escrow
        campaign.setEscrowAllocated(newAllocated);
        if (newAllocated.compareTo(campaign.getBudget()) >= 0) {
            campaign.setEscrowStatus("FUNDED");
        } else {
            campaign.setEscrowStatus("PARTIAL");
        }
        campaignRepository.save(campaign);

        // Record transaction
        createEscrowTransaction(
                brandId,
                campaignId,
                null,
                EscrowTransactionType.ALLOCATION,
                amount,
                balanceBefore,
                wallet.getBalance(),
                "Allocated to campaign: " + campaign.getTitle(),
                Map.of(
                        "campaignTitle", campaign.getTitle(),
                        "campaignBudget", campaign.getBudget(),
                        "newEscrowAllocated", newAllocated
                )
        );

        log.info("Allocated to campaign: brand={}, campaign={}, amount={}, newBalance={}",
                brandId, campaignId, amount, wallet.getBalance());
    }

    /**
     * Release funds from campaign escrow to creator
     * Called when deliverable is approved
     */
    @Transactional
    public void releaseToCreator(String campaignId, String creatorId,
                                  BigDecimal amount, String reason) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Release amount must be greater than zero");
        }

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));

        String brandId = campaign.getBrand().getId();

        // Check campaign has funds
        BigDecimal available = campaign.getEscrowAllocated()
                .subtract(campaign.getEscrowReleased());

        if (available.compareTo(amount) < 0) {
            throw new BusinessException(
                    "Insufficient campaign escrow. Available: ₹" + available +
                            ", Requested: ₹" + amount
            );
        }

        // Update campaign escrow
        BigDecimal newReleased = campaign.getEscrowReleased().add(amount);
        campaign.setEscrowReleased(newReleased);
        if (newReleased.equals(campaign.getEscrowAllocated())) {
            campaign.setEscrowStatus("RELEASED");
        }
        campaignRepository.save(campaign);

        // Update brand wallet stats (no balance change)
        BrandWallet wallet = brandWalletRepository.findByBrandIdWithLock(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("BrandWallet", brandId));
        wallet.trackRelease(amount);
        brandWalletRepository.save(wallet);

        // Credit creator wallet (with platform fee deduction)
        walletService.creditWallet(creatorId, amount, reason, campaignId);

        // Record transaction (no wallet balance change)
        createEscrowTransaction(
                brandId,
                campaignId,
                null,
                EscrowTransactionType.RELEASE,
                amount,
                null, // No wallet balance change
                null,
                "Released to creator: " + reason,
                Map.of(
                        "creatorId", creatorId,
                        "campaignTitle", campaign.getTitle(),
                        "reason", reason
                )
        );

        log.info("Released to creator: campaign={}, creator={}, amount={}, reason={}",
                campaignId, creatorId, amount, reason);
    }

    /**
     * Refund unused campaign funds back to wallet
     * Called when campaign ends or is cancelled
     */
    @Transactional
    public void refundUnusedCampaignFunds(String campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));

        String brandId = campaign.getBrand().getId();

        // Calculate unused amount
        BigDecimal unused = campaign.getEscrowAllocated()
                .subtract(campaign.getEscrowReleased());

        if (unused.compareTo(BigDecimal.ZERO) <= 0) {
            log.info("No unused funds to refund for campaign: {}", campaignId);
            return;
        }

        // Lock wallet
        BrandWallet wallet = brandWalletRepository.findByBrandIdWithLock(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("BrandWallet", brandId));

        BigDecimal balanceBefore = wallet.getBalance();

        // Credit wallet
        wallet.refundFromCampaign(unused);
        brandWalletRepository.save(wallet);

        // Update campaign
        campaign.setEscrowAllocated(campaign.getEscrowReleased());
        campaign.setEscrowStatus("REFUNDED");
        campaignRepository.save(campaign);

        // Record transaction
        createEscrowTransaction(
                brandId,
                campaignId,
                null,
                EscrowTransactionType.REFUND,
                unused,
                balanceBefore,
                wallet.getBalance(),
                "Refund of unused campaign funds: " + campaign.getTitle(),
                Map.of(
                        "campaignTitle", campaign.getTitle(),
                        "originallyAllocated", campaign.getEscrowAllocated().add(unused),
                        "released", campaign.getEscrowReleased()
                )
        );

        log.info("Refunded unused funds: campaign={}, amount={}, newBalance={}",
                campaignId, unused, wallet.getBalance());
    }

    /**
     * Get escrow transaction history
     */
    @Transactional(readOnly = true)
    public Page<EscrowTransactionDTO> getTransactions(String brandId, Pageable pageable) {
        Page<EscrowTransaction> transactions = escrowTransactionRepository
                .findByBrandIdOrderByCreatedAtDesc(brandId, pageable);

        return transactions.map(this::toDTO);
    }

    /**
     * Get transactions for a specific campaign.
     * Verifies brand ownership before returning data.
     */
    @Transactional(readOnly = true)
    public Page<EscrowTransactionDTO> getCampaignTransactions(String campaignId, String brandId, Pageable pageable) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", campaignId));

        if (!campaign.getBrand().getId().equals(brandId)) {
            throw new BusinessException("Cannot access transactions for campaigns you don't own");
        }

        Page<EscrowTransaction> transactions = escrowTransactionRepository
                .findByCampaignIdOrderByCreatedAtDesc(campaignId, pageable);

        return transactions.map(this::toDTO);
    }

    // Helper methods

    private BrandWallet createWallet(String brandId) {
        User brand = userRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("User", brandId));

        BrandWallet wallet = BrandWallet.builder()
                .brandId(brandId)
                .brand(brand)
                .balance(BigDecimal.ZERO)
                .totalDeposited(BigDecimal.ZERO)
                .totalAllocated(BigDecimal.ZERO)
                .totalReleased(BigDecimal.ZERO)
                .currency("INR")
                .build();

        BrandWallet saved = brandWalletRepository.save(wallet);
        log.info("Created brand wallet: brandId={}", brandId);
        return saved;
    }

    private void createEscrowTransaction(
            String brandId, String campaignId, String paymentOrderId,
            EscrowTransactionType type, BigDecimal amount,
            BigDecimal balanceBefore, BigDecimal balanceAfter,
            String description, Map<String, Object> metadata) {

        EscrowTransaction tx = EscrowTransaction.builder()
                .id(UUID.randomUUID().toString())
                .brandId(brandId)
                .campaignId(campaignId)
                .paymentOrderId(paymentOrderId)
                .type(type)
                .amount(amount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .description(description)
                .metadata(metadata != null ? metadata : new HashMap<>())
                .build();

        escrowTransactionRepository.save(tx);
    }

    private EscrowTransactionDTO toDTO(EscrowTransaction tx) {
        EscrowTransactionDTO dto = EscrowTransactionDTO.builder()
                .id(tx.getId())
                .brandId(tx.getBrandId())
                .campaignId(tx.getCampaignId())
                .paymentOrderId(tx.getPaymentOrderId())
                .type(tx.getType())
                .amount(tx.getAmount())
                .balanceBefore(tx.getBalanceBefore())
                .balanceAfter(tx.getBalanceAfter())
                .description(tx.getDescription())
                .metadata(tx.getMetadata())
                .createdAt(tx.getCreatedAt())
                .build();

        // Enrich with campaign title if available
        if (tx.getCampaign() != null) {
            dto.setCampaignTitle(tx.getCampaign().getTitle());
        }

        return dto;
    }
}
