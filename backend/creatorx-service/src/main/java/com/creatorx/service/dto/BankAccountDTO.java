package com.creatorx.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountDTO {
    private String id;
    private String accountHolderName;
    private String accountNumber; // Masked: XXXX1234
    private String ifscCode;
    private String bankName;
    private String branchName;
    private String upiId;
    private Boolean verified;
    private Boolean isDefault;
}

