package com.elevateai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "interview_qa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private InterviewReport report;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "user_answer", nullable = false, columnDefinition = "TEXT")
    private String userAnswer;

    @Column(nullable = false)
    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String correctness;

    @Column(name = "technical_knowledge", columnDefinition = "TEXT")
    private String technicalKnowledge;
}
