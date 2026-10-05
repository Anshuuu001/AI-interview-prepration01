package com.elevateai.backend.repository;

import com.elevateai.backend.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, String> {
    List<ActivityLog> findByUserIdAndTemplateIdOrderByTimestampAsc(String userId, String templateId);
    List<ActivityLog> findAllByOrderByTimestampDesc();
}
