package com.creatorx.repository.entity;

import com.creatorx.common.enums.ComplianceReportStatus;
import com.creatorx.common.enums.ComplianceReportType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "compliance_reports", indexes = {
    @Index(name = "idx_compliance_reports_type", columnList = "report_type"),
    @Index(name = "idx_compliance_reports_region", columnList = "region"),
    @Index(name = "idx_compliance_reports_status", columnList = "status"),
    @Index(name = "idx_compliance_reports_created_at", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "generatedBy")
public class ComplianceReport extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ComplianceReportType reportType;

    @Column(nullable = false, length = 50)
    private String region;

    @Column(name = "period_start")
    private LocalDateTime periodStart;

    @Column(name = "period_end")
    private LocalDateTime periodEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ComplianceReportStatus status = ComplianceReportStatus.PENDING;

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "details_json", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private Map<String, Object> detailsJson = new HashMap<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by")
    private User generatedBy;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;
}
