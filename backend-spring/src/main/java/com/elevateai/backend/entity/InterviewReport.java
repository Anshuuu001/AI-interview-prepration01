package com.elevateai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "interview_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewReport {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "role_title", nullable = false, length = 100)
    private String roleTitle;

    @Column(nullable = false, length = 50)
    private String date;

    @Column(nullable = false)
    private Integer duration;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "technical_score", nullable = false)
    private Integer technicalScore;

    @Column(name = "behavioral_score", nullable = false)
    private Integer behavioralScore;

    @Column(name = "presence_score", nullable = false)
    private Integer presenceScore;

    @Column(name = "integrity_score", columnDefinition = "INT DEFAULT 100")
    private Integer integrityScore = 100;

    @Column(name = "warnings_count", columnDefinition = "INT DEFAULT 0")
    private Integer warningsCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "cheating_risk", columnDefinition = "ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Low'")
    private CheatingRisk cheatingRisk = CheatingRisk.Low;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String feedback;

    public enum CheatingRisk {
        Low,
        Medium,
        High,
        Critical
    }
}
