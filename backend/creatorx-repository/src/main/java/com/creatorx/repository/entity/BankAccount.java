package com.creatorx.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bank_accounts", indexes = {
        @Index(name = "idx_bank_accounts_user_id", columnList = "user_id"),
        @Index(name = "idx_verified", columnList = "verified"),
        @Index(name = "idx_default", columnList = "user_id,is_default")
})
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "user", "withdrawalRequests" })
public class BankAccount extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "account_holder_name", nullable = false)
    private String accountHolderName;

    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "ifsc_code", nullable = false, length = 11)
    private String ifscCode;

    @Column(name = "upi_id", length = 255)
    private String upiId;

    @Column(name = "bank_name", length = 255)
    private String bankName;

    @Column(name = "branch_name", length = 255)
    private String branchName;

    @Builder.Default
    private Boolean verified = false;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @OneToMany(mappedBy = "bankAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WithdrawalRequest> withdrawalRequests = new ArrayList<>();
}
