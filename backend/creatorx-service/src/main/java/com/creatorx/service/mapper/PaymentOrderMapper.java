package com.creatorx.service.mapper;

import com.creatorx.repository.entity.PaymentOrder;
import com.creatorx.service.dto.PaymentOrderDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * Mapper for PaymentOrder entity to DTO
 * Phase 4.2: Brand Payment Collection
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PaymentOrderMapper {

    @Mapping(source = "brand.id", target = "brandId")
    @Mapping(source = "brand.brandProfile.companyName", target = "brandName")
    @Mapping(source = "campaign.id", target = "campaignId")
    @Mapping(source = "campaign.title", target = "campaignTitle")
    PaymentOrderDTO toDTO(PaymentOrder paymentOrder);

    List<PaymentOrderDTO> toDTOList(List<PaymentOrder> paymentOrders);
}
