package com.creatorx.repository.entity;

import com.creatorx.common.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "active_campaigns", indexes = {
    @Index(name = "idx_creator", columnList = "creator_id"),
    @Index(name = "idx_campaign", columnList = "campaign_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveCampaign extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal paymentAmount;
    
    @Column(nullable = false)
    private LocalDate deadline;
    
    @OneToMany(mappedBy = "activeCampaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Deliverable> deliverables = new ArrayList<>();
    
    private LocalDate completedAt;
}




