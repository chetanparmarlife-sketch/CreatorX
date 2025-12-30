package com.creatorx.repository;

import com.creatorx.repository.entity.PlatformSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, String> {
    @Query("SELECT p FROM PlatformSetting p WHERE p.key = :key")
    Optional<PlatformSetting> findByKey(@Param("key") String key);
}
