package com.ugc.anomaly.controller;

import com.ugc.anomaly.entity.AnomalyEntity;
import com.ugc.anomaly.service.AnomalyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/anomalies")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
@RequiredArgsConstructor
public class AnomalyController {

    private final AnomalyService anomalyService;

    @GetMapping
    public ResponseEntity<List<AnomalyEntity>> getAllAnomalies() {
        return ResponseEntity.ok(anomalyService.getAllAnomalies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnomalyEntity> getAnomalyById(@PathVariable("id") String id) {
        return ResponseEntity.ok(anomalyService.getAnomalyById(id));
    }

    @PostMapping({"", "/", "/create"})
    public ResponseEntity<AnomalyEntity> createAnomaly(@RequestBody AnomalyEntity anomaly) {
        return ResponseEntity.ok(anomalyService.saveAnomaly(anomaly));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Map<String, Object>> resolveAnomalyPost(@PathVariable("id") String id) {
        boolean success = anomalyService.resolveAnomaly(id);
        return ResponseEntity.ok(Map.of("id", id, "resolved", success, "status", "RESOLVED"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> resolveAnomalyDelete(@PathVariable("id") String id) {
        boolean success = anomalyService.resolveAnomaly(id);
        return ResponseEntity.ok(Map.of("id", id, "resolved", success, "status", "RESOLVED"));
    }

    @PostMapping("/{id}/dispatch-notice")
    public ResponseEntity<Map<String, Object>> dispatchNotice(@PathVariable("id") String id, @RequestBody(required = false) Map<String, String> body) {
        String noticeText = body != null ? body.get("noticeText") : null;
        return ResponseEntity.ok(anomalyService.dispatchNotice(id, noticeText));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategorySummary() {
        return ResponseEntity.ok(anomalyService.getCategorySummary());
    }
}
