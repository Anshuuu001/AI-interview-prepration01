package com.elevateai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "template_id", nullable = false, length = 50)
    private String templateId;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false)
    private Long timestamp;
}
