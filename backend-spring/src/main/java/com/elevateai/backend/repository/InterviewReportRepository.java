package com.elevateai.backend.repository;

import com.elevateai.backend.entity.InterviewReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewReportRepository extends JpaRepository<InterviewReport, String> {
    List<InterviewReport> findByUserIdOrderByDateDesc(String userId);
}
