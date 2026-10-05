package com.elevateai.backend.repository;

import com.elevateai.backend.entity.WarningLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarningLogRepository extends JpaRepository<WarningLog, String> {
    List<WarningLog> findByUserIdAndTemplateIdOrderByTimestampAsc(String userId, String templateId);
    List<WarningLog> findAllByOrderByTimestampDesc();
}
