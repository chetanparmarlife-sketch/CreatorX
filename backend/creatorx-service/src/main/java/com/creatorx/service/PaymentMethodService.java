package com.creatorx.service;

import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.PaymentMethodRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.entity.PaymentMethod;
import com.creatorx.repository.entity.User;
import com.creatorx.service.dto.PaymentMethodDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing payment methods (saved cards) for brands.
 * Uses Razorpay tokenization for PCI compliance.
 * 
 * Phase 4.1: Brand Payment Collection
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final UserRepository userRepository;

    /**
     * Get all active payment methods for a user
     */
    @Transactional(readOnly = true)
    public List<PaymentMethodDTO> getPaymentMethods(String userId) {
        List<PaymentMethod> paymentMethods = paymentMethodRepository.findByUserId(userId);
        return paymentMethods.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Add a new payment method using Razorpay token
     * 
     * @param userId             User ID
     * @param razorpayCustomerId Razorpay customer ID (if customer was created)
     * @param razorpayTokenId    Razorpay token ID from frontend tokenization
     * @param cardLast4          Last 4 digits of card
     * @param cardNetwork        Card network (visa, mastercard, etc.)
     * @param cardType           Card type (credit, debit)
     * @param expiryMonth        Expiry month
     * @param expiryYear         Expiry year
     * @param cardholderName     Cardholder name
     * @return PaymentMethodDTO
     */
    @Transactional
    public PaymentMethodDTO addPaymentMethod(
            String userId,
            String razorpayCustomerId,
            String razorpayTokenId,
            String cardLast4,
            String cardNetwork,
            String cardType,
            String expiryMonth,
            String expiryYear,
            String cardholderName) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Check for duplicate token
        if (paymentMethodRepository.findByRazorpayTokenId(razorpayTokenId).isPresent()) {
            throw new BusinessException("This payment method has already been added");
        }

        // Check if this is the first payment method (set as default)
        List<PaymentMethod> existingMethods = paymentMethodRepository.findByUserId(userId);
        boolean isDefault = existingMethods.isEmpty();

        // If setting as default, unset other defaults
        if (isDefault && !existingMethods.isEmpty()) {
            existingMethods.forEach(pm -> pm.setIsDefault(false));
            paymentMethodRepository.saveAll(existingMethods);
        }

        PaymentMethod paymentMethod = PaymentMethod.builder()
                .user(user)
                .razorpayCustomerId(razorpayCustomerId)
                .razorpayTokenId(razorpayTokenId)
                .cardLast4(cardLast4)
                .cardNetwork(cardNetwork != null ? cardNetwork.toLowerCase() : null)
                .cardType(cardType != null ? cardType.toLowerCase() : null)
                .expiryMonth(expiryMonth)
                .expiryYear(expiryYear)
                .cardholderName(cardholderName)
                .isDefault(isDefault)
                .active(true)
                .build();

        paymentMethod = paymentMethodRepository.save(paymentMethod);

        log.info("Payment method added: {} for user: {} (card: ****{})",
                paymentMethod.getId(), userId, cardLast4);

        return toDTO(paymentMethod);
    }

    /**
     * Remove a payment method (soft delete)
     */
    @Transactional
    public void removePaymentMethod(String userId, String paymentMethodId) {
        PaymentMethod paymentMethod = paymentMethodRepository.findByIdAndUserId(paymentMethodId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment method", paymentMethodId));

        // Soft delete - mark as inactive
        paymentMethod.setActive(false);
        paymentMethodRepository.save(paymentMethod);

        // If this was the default, set another as default
        if (paymentMethod.getIsDefault()) {
            List<PaymentMethod> otherMethods = paymentMethodRepository.findByUserId(userId)
                    .stream()
                    .filter(pm -> !pm.getId().equals(paymentMethodId) && pm.getActive())
                    .collect(Collectors.toList());

            if (!otherMethods.isEmpty()) {
                otherMethods.get(0).setIsDefault(true);
                paymentMethodRepository.save(otherMethods.get(0));
            }
        }

        log.info("Payment method removed: {} for user: {}", paymentMethodId, userId);
    }

    /**
     * Set a payment method as default
     */
    @Transactional
    public void setDefaultPaymentMethod(String userId, String paymentMethodId) {
        PaymentMethod paymentMethod = paymentMethodRepository.findByIdAndUserId(paymentMethodId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment method", paymentMethodId));

        if (!paymentMethod.getActive()) {
            throw new BusinessException("Cannot set inactive payment method as default");
        }

        // Unset all other defaults
        List<PaymentMethod> allMethods = paymentMethodRepository.findByUserId(userId);
        allMethods.forEach(pm -> pm.setIsDefault(false));
        paymentMethodRepository.saveAll(allMethods);

        // Set this as default
        paymentMethod.setIsDefault(true);
        paymentMethodRepository.save(paymentMethod);

        log.info("Default payment method set: {} for user: {}", paymentMethodId, userId);
    }

    /**
     * Convert entity to DTO
     */
    private PaymentMethodDTO toDTO(PaymentMethod paymentMethod) {
        return PaymentMethodDTO.builder()
                .id(paymentMethod.getId())
                .cardLast4(paymentMethod.getCardLast4())
                .cardNetwork(paymentMethod.getCardNetwork())
                .cardType(paymentMethod.getCardType())
                .expiryMonth(paymentMethod.getExpiryMonth())
                .expiryYear(paymentMethod.getExpiryYear())
                .cardholderName(paymentMethod.getCardholderName())
                .isDefault(paymentMethod.getIsDefault())
                .createdAt(paymentMethod.getCreatedAt())
                .build();
    }
}
