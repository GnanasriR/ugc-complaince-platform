package com.ugc.analytics.controller;

import com.ugc.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/pipeline-stages")
    public ResponseEntity<List<Map<String, Object>>> getPipelineStages() {
        return ResponseEntity.ok(analyticsService.getPipelineStages());
    }

    @GetMapping("/compliance-by-type")
    public ResponseEntity<List<Map<String, Object>>> getComplianceByType() {
        return ResponseEntity.ok(analyticsService.getComplianceByType());
    }

    @GetMapping("/trends")
    public ResponseEntity<List<Map<String, Object>>> getTrendData() {
        return ResponseEntity.ok(analyticsService.getTrendData());
    }

    @GetMapping("/evaluators/consistency")
    public ResponseEntity<List<Map<String, Object>>> getEvaluatorConsistency() {
        return ResponseEntity.ok(analyticsService.getEvaluatorConsistencyMetrics());
    }

    @GetMapping("/reports/application/{appId}")
    public ResponseEntity<Map<String, Object>> generateReport(@PathVariable("appId") String appId) {
        return ResponseEntity.ok(analyticsService.generatePdfReport(appId));
    }
}
