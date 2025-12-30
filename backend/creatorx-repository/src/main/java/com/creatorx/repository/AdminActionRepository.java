package com.creatorx.repository;

import com.creatorx.repository.entity.AdminAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminActionRepository extends JpaRepository<AdminAction, String>, JpaSpecificationExecutor<AdminAction> {
}
