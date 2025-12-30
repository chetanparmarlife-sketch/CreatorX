package com.creatorx.repository;

import com.creatorx.common.enums.AppealStatus;
import com.creatorx.repository.entity.AccountAppeal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountAppealRepository extends JpaRepository<AccountAppeal, String> {
    @Query("SELECT a FROM AccountAppeal a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    Page<AccountAppeal> findByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT a FROM AccountAppeal a WHERE a.status = :status ORDER BY a.createdAt DESC")
    Page<AccountAppeal> findByStatus(@Param("status") AppealStatus status, Pageable pageable);

    long countByStatus(AppealStatus status);
}
