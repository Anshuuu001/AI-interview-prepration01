package com.elevateai.backend.repository;

import com.elevateai.backend.entity.AptitudeResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AptitudeResultRepository extends JpaRepository<AptitudeResult, String> {
    List<AptitudeResult> findByUserIdOrderByDateDesc(String userId);
}
