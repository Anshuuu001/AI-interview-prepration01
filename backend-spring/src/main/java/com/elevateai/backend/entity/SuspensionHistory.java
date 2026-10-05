package com.elevateai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "suspension_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuspensionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "start_time", nullable = false)
    private Long startTime;

    @Column(name = "end_time", nullable = false)
    private Long endTime;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "warnings_count", nullable = false)
    private Integer warningsCount;

    @Column(nullable = false, length = 45)
    private String ip;

    @Column(nullable = false, length = 255)
    private String device;

    @Column(nullable = false, length = 255)
    private String browser;

    @Column(nullable = false, length = 255)
    private String os;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('active', 'expired', 'lifted') DEFAULT 'active'")
    private SuspensionStatus status = SuspensionStatus.active;

    public enum SuspensionStatus {
        active,
        expired,
        lifted
    }
}
