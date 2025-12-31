package com.creatorx.repository;

import com.creatorx.repository.entity.DisputeNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeNoteRepository extends JpaRepository<DisputeNote, String> {
    List<DisputeNote> findByDisputeIdOrderByCreatedAtDesc(String disputeId);
}
