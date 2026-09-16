package com.ugc.anomaly.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ugc.anomaly.entity.AnomalyEntity;
import com.ugc.anomaly.repository.AnomalyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnomalyService {

    private final AnomalyRepository anomalyRepository;

    public List<AnomalyEntity> getAllAnomalies() {
        try {
            List<AnomalyEntity> anomalies = anomalyRepository.findAll();
            if (anomalies != null && !anomalies.isEmpty()) {
                return anomalies;
            }
        } catch (Exception e) {
            // Fallback if MongoDB is not initialized
        }

        AnomalyEntity a1 = AnomalyEntity.builder()
                .id("ANOM-2025-001")
                .title("Faculty-to-Student Ratio Discrepancy")
                .category("FACULTY_RATIO")
                .severity("CRITICAL")
                .confidence(94)
                .description("Reported faculty strength (45) does not meet minimum regulatory norm (60) for student intake.")
                .affectedApps("UGC-2025-78910")
                .detectedAt(LocalDateTime.now())
                .build();

        AnomalyEntity a2 = AnomalyEntity.builder()
                .id("ANOM-2025-002")
                .title("Duplicate Infrastructure Document Hash")
                .category("DOCUMENT_DUPLICATION")
                .severity("HIGH")
                .confidence(88)
                .description("Identical land allocation PDF hash detected across two distinct university applications.")
                .affectedApps("UGC-2025-78911, UGC-2025-79004")
                .detectedAt(LocalDateTime.now())
                .build();

        AnomalyEntity a3 = AnomalyEntity.builder()
                .id("ANOM-2025-003")
                .title("Abnormal Financial Reserves Variance")
                .category("FINANCIAL_DISCREPANCY")
                .severity("MEDIUM")
                .confidence(79)
                .description("Self-reported endowment fund exceeds verified audit statement by 34%.")
                .affectedApps("UGC-2025-78915")
                .detectedAt(LocalDateTime.now())
                .build();

        List<AnomalyEntity> defaults = List.of(a1, a2, a3);
        try {
            return anomalyRepository.saveAll(defaults);
        } catch (Exception e) {
            return defaults;
        }
    }

    public AnomalyEntity getAnomalyById(String id) {
        try {
            return anomalyRepository.findById(id).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    public AnomalyEntity saveAnomaly(AnomalyEntity anomaly) {
        if (anomaly.getId() == null) {
            anomaly.setId("ANOM-2025-" + String.format("%03d", new Random().nextInt(900) + 100));
        }
        if (anomaly.getDetectedAt() == null) {
            anomaly.setDetectedAt(LocalDateTime.now());
        }
        return anomalyRepository.save(anomaly);
    }

    public boolean resolveAnomaly(String id) {
        try {
            AnomalyEntity anomaly = getAnomalyById(id);
            if (anomaly != null) {
                anomaly.setStatus("RESOLVED");
                anomalyRepository.save(anomaly);
                return true;
            }
            if (anomalyRepository.existsById(id)) {
                anomalyRepository.deleteById(id);
                return true;
            }
        } catch (Exception e) {}
        return false;
    }

    public Map<String, Object> dispatchNotice(String id, String noticeText) {
        AnomalyEntity anomaly = getAnomalyById(id);
        if (anomaly != null) {
            anomaly.setStatus("NOTICE_DISPATCHED");
            try {
                anomalyRepository.save(anomaly);
            } catch (Exception e) {}
        }
        String title = anomaly != null ? anomaly.getTitle() : "Regulatory Discrepancy Notice";
        String recipient = anomaly != null ? anomaly.getAffectedApps() : "UGC Applicant";
        String desc = anomaly != null ? anomaly.getDescription() : "Detected discrepancy in submitted documentation.";

        Map<String, Object> notice = new HashMap<>();
        notice.put("noticeId", "NTC-2025-" + String.format("%04d", new Random().nextInt(9000) + 1000));
        notice.put("anomalyId", id);
        notice.put("title", title);
        notice.put("recipient", recipient);
        notice.put("noticeText", noticeText != null ? noticeText : "Formal notice issued citing discrepancy: " + desc);
        notice.put("responseDeadlineDays", 14);
        notice.put("dispatchedAt", LocalDateTime.now());
        notice.put("status", "PENDING_INSTITUTION_RESPONSE");

        return notice;
    }

    public List<Map<String, Object>> getCategorySummary() {
        List<AnomalyEntity> anomalies = getAllAnomalies();
        Map<String, Long> categoryCounts = anomalies.stream()
                .collect(Collectors.groupingBy(AnomalyEntity::getCategory, Collectors.counting()));

        List<Map<String, Object>> summary = new ArrayList<>();
        categoryCounts.forEach((category, count) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("category", category);
            map.put("count", count);
            summary.add(map);
        });

        return summary;
    }
}
