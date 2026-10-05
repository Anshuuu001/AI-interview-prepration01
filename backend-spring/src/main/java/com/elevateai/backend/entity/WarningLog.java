package com.elevateai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "warning_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarningLog {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "template_id", nullable = false, length = 50)
    private String templateId;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "warning_count", nullable = false)
    private Integer warningCount;

    @Column(nullable = false)
    private Long timestamp;

    @Column(nullable = false, length = 45)
    private String ip;

    @Column(nullable = false, length = 255)
    private String device;
}
