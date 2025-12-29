package com.creatorx.repository.entity;

import com.creatorx.common.enums.SubmissionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "deliverable_reviews", indexes = {
    @Index(name = "idx_deliverable_reviews_reviewer_id", columnList = "reviewer_id"),
    @Index(name = "idx_deliverable_reviews_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"submission", "reviewer"})
public class DeliverableReview {
    @Id
    @Column(name = "submission_id")
    private String submissionId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    @MapsId
    private DeliverableSubmission submission;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Column(name = "revision_notes", columnDefinition = "TEXT")
    private String revisionNotes;
    
    @Column(name = "reviewed_at", nullable = false, updatable = false)
    private LocalDateTime reviewedAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

