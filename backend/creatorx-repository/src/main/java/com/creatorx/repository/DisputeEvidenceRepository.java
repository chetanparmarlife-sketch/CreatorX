package com.creatorx.repository;

import com.creatorx.repository.entity.DisputeEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeEvidenceRepository extends JpaRepository<DisputeEvidence, String> {
    List<DisputeEvidence> findByDisputeId(String disputeId);
}
