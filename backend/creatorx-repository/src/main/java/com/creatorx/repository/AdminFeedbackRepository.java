package com.creatorx.repository;

import com.creatorx.repository.entity.AdminFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AdminFeedbackRepository extends JpaRepository<AdminFeedback, String> {
    @Query("SELECT AVG(f.rating) FROM AdminFeedback f WHERE f.createdAt >= :from")
    Double averageRatingSince(@Param("from") LocalDateTime from);

    @Query("SELECT COUNT(f) FROM AdminFeedback f WHERE f.createdAt >= :from")
    long countSince(@Param("from") LocalDateTime from);
}
