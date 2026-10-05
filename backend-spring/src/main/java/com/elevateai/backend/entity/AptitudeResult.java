package com.elevateai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "aptitude_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AptitudeResult {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String date;

    @Column(nullable = false)
    private Integer percentage;

    @Column(name = "correct_answers", nullable = false)
    private Integer correctAnswers;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false, length = 50)
    private String duration;

    @Column(columnDefinition = "TEXT")
    private String details;
}
