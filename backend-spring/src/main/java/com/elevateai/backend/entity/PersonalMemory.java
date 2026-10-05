package com.elevateai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "personal_memories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalMemory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String resume;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "career_goal", length = 255)
    private String careerGoal = "Graduate Candidate";

    @Column(name = "weak_topics", columnDefinition = "TEXT")
    private String weakTopics;

    @Column(name = "strong_topics", columnDefinition = "TEXT")
    private String strongTopics;

    @Column(name = "preferred_language", length = 50)
    private String preferredLanguage = "English";

    @Column(name = "learning_style", length = 100)
    private String learningStyle = "Practical & Example-Driven";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "uploaded_pdfs", columnDefinition = "TEXT")
    private String uploadedPdfs;

    @Column(name = "updated_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;
}
