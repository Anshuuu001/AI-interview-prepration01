package com.elevateai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "learning_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningLog {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String question;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('helpful', 'unhelpful') DEFAULT 'helpful'")
    private Rating rating = Rating.helpful;

    @Column(name = "time_taken", columnDefinition = "INT DEFAULT 10")
    private Integer timeTaken = 10;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium'")
    private Difficulty difficulty = Difficulty.Medium;

    @Column(length = 100)
    private String topic = "General Technical";

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('Correct', 'Incorrect') DEFAULT 'Correct'")
    private Outcome outcome = Outcome.Correct;

    @Column(nullable = false)
    private Long timestamp;

    public enum Rating {
        helpful,
        unhelpful
    }

    public enum Difficulty {
        Easy,
        Medium,
        Hard
    }

    public enum Outcome {
        Correct,
        Incorrect
    }
}
