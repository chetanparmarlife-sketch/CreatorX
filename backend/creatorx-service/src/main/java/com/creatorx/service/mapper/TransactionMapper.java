package com.creatorx.service.mapper;

import com.creatorx.repository.entity.Transaction;
import com.creatorx.service.dto.TransactionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TransactionMapper {
    
    @Mapping(target = "campaign", ignore = true) // Mapped in service
    @Mapping(target = "campaignId", ignore = true) // Mapped in service
    TransactionDTO toDTO(Transaction transaction);
    
    List<TransactionDTO> toDTOList(List<Transaction> transactions);
}

