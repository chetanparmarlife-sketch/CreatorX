package com.creatorx.service.mapper;

import com.creatorx.repository.entity.BankAccount;
import com.creatorx.service.dto.BankAccountDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BankAccountMapper {
    
    @Mapping(target = "accountNumber", expression = "java(maskAccountNumber(bankAccount.getAccountNumber()))")
    BankAccountDTO toDTO(BankAccount bankAccount);
    
    List<BankAccountDTO> toDTOList(List<BankAccount> bankAccounts);
    
    default String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4) {
            return accountNumber;
        }
        // Mask all but last 4 digits: XXXX1234
        int length = accountNumber.length();
        return "XXXX" + accountNumber.substring(length - 4);
    }
}

