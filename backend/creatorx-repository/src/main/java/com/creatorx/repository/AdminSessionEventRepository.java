package com.creatorx.repository;

import com.creatorx.repository.entity.AdminSessionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AdminSessionEventRepository extends JpaRepository<AdminSessionEvent, String> {
    @Query("SELECT COUNT(DISTINCT e.admin.id) FROM AdminSessionEvent e " +
            "WHERE e.occurredAt >= :from AND e.occurredAt <= :to")
    long countDistinctAdmins(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
