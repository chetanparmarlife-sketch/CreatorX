package com.creatorx.repository;

import com.creatorx.repository.entity.BrandListCreator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * BrandListCreatorRepository.
 *
 * Provides database access for creators inside brand lists, including duplicate
 * checks and removal by list/creator pair.
 */
@Repository
public interface BrandListCreatorRepository extends JpaRepository<BrandListCreator, String> {
    @Query("SELECT entry FROM BrandListCreator entry WHERE entry.list.id = :listId")
    List<BrandListCreator> findByListId(@Param("listId") String listId);

    @Query("SELECT entry FROM BrandListCreator entry WHERE entry.list.id = :listId AND entry.creatorId = :creatorId")
    Optional<BrandListCreator> findByListIdAndCreatorId(
            @Param("listId") String listId,
            @Param("creatorId") String creatorId);

    @Modifying
    @Query("DELETE FROM BrandListCreator entry WHERE entry.list.id = :listId AND entry.creatorId = :creatorId")
    void deleteByListIdAndCreatorId(@Param("listId") String listId, @Param("creatorId") String creatorId);

    @Query("SELECT COUNT(entry) > 0 FROM BrandListCreator entry WHERE entry.list.id = :listId AND entry.creatorId = :creatorId")
    boolean existsByListIdAndCreatorId(@Param("listId") String listId, @Param("creatorId") String creatorId);
}
