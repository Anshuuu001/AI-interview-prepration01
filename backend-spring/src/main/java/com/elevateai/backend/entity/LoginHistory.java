package com.elevateai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "login_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Long timestamp;

    @Column(nullable = false, length = 45)
    private String ip;

    @Column(nullable = false, length = 255)
    private String device;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('success', 'failed', 'locked')")
    private LoginStatus status;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean suspicious = false;

    public enum LoginStatus {
        success,
        failed,
        locked
    }
}
