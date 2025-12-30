package com.creatorx.repository;

import com.creatorx.repository.entity.AdminPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminPermissionRepository extends JpaRepository<AdminPermission, String> {
    @Query("SELECT p FROM AdminPermission p WHERE p.admin.id = :adminId")
    List<AdminPermission> findByAdminId(@Param("adminId") String adminId);

    @Query("SELECT COUNT(p) > 0 FROM AdminPermission p WHERE p.admin.id = :adminId AND p.permission = :permission")
    boolean existsByAdminIdAndPermission(@Param("adminId") String adminId, @Param("permission") String permission);
}
