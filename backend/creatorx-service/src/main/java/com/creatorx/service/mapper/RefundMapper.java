package com.creatorx.service.mapper;

import com.creatorx.repository.entity.Refund;
import com.creatorx.service.dto.RefundDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * Mapper for Refund entity to DTO
 * Phase 4.2: Razorpay Refund Integration
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RefundMapper {

    @Mapping(source = "paymentOrder.id", target = "paymentOrderId")
    @Mapping(source = "initiatedBy.id", target = "initiatedById")
    @Mapping(source = "initiatedBy.displayName", target = "initiatedByName")
    RefundDTO toDTO(Refund refund);

    List<RefundDTO> toDTOList(List<Refund> refunds);
}
