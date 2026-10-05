package com.elevateai.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    @GetMapping("/templates")
    public ResponseEntity<?> getTemplates() {
        // Return template list skeleton (matches default templates in frontend)
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        // Return user interview reports history
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitInterview(@RequestBody Map<String, Object> submissionData) {
        // Process interview submission and return scoring result
        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("overallScore", 85);
        mockResponse.put("technicalScore", 88);
        mockResponse.put("behavioralScore", 82);
        mockResponse.put("cheatingRisk", "Low");
        mockResponse.put("feedback", "Good performance, solid knowledge displayed.");
        return ResponseEntity.ok(mockResponse);
    }

    @GetMapping("/aptitude")
    public ResponseEntity<?> getAptitudeQuestions() {
        // Return default aptitude questions list
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/aptitude/history")
    public ResponseEntity<?> getAptitudeHistory() {
        // Return candidate aptitude test reports
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/aptitude/submit")
    public ResponseEntity<?> submitAptitude(@RequestBody Map<String, Object> resultData) {
        // Save score and return percentage details
        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("percentage", 90);
        return ResponseEntity.ok(mockResponse);
    }

    @PostMapping("/session-start")
    public ResponseEntity<?> startSession(@RequestBody Map<String, Object> sessionInfo) {
        return ResponseEntity.ok(Collections.singletonMap("status", "session_started"));
    }

    @PostMapping("/log-warning")
    public ResponseEntity<?> logWarning(@RequestBody Map<String, Object> warningInfo) {
        return ResponseEntity.ok(Collections.singletonMap("status", "warning_logged"));
    }

    @PostMapping("/log-activity")
    public ResponseEntity<?> logActivity(@RequestBody Map<String, Object> activityInfo) {
        return ResponseEntity.ok(Collections.singletonMap("status", "activity_logged"));
    }

    @GetMapping("/warnings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getWarningsList() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/activities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getActivityLogsList() {
        return ResponseEntity.ok(Collections.emptyList());
    }
}
