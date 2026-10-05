package com.elevateai.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "nexus_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NexusConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "active_model", length = 100)
    private String activeModel = "qwen3-8b";

    @Column(name = "active_version", length = 50)
    private String activeVersion = "Nexus AI v1.0";

    @Column(name = "ollama_url", length = 255)
    private String ollamaUrl = "http://localhost:11434";

    @Column(name = "is_finetuning", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isFinetuning = false;

    @Column(name = "finetune_progress")
    private Integer finetuneProgress = 0;

    @Column(name = "finetune_logs", columnDefinition = "TEXT")
    private String finetuneLogs;

    @Column(name = "updated_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;
}
