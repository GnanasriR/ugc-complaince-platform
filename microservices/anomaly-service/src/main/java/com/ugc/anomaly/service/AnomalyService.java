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
import com.ugc.anomaly.exception.ResourceNotFoundException;
import com.ugc.anomaly.repository.AnomalyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnomalyService {

    private final AnomalyRepository anomalyRepository;

    public List<AnomalyEntity> getAllAnomalies() {
        return anomalyRepository.findAll();
    }

    public AnomalyEntity getAnomalyById(String id) {
        return anomalyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anomaly not found: " + id));
    }

    public Map<String, Object> dispatchNotice(String id, String noticeText) {
        AnomalyEntity anomaly = getAnomalyById(id);

        Map<String, Object> notice = new HashMap<>();
        notice.put("noticeId", "NTC-2025-" + String.format("%04d", new Random().nextInt(9000) + 1000));
        notice.put("anomalyId", id);
        notice.put("title", anomaly.getTitle());
        notice.put("recipient", anomaly.getAffectedApps());
        notice.put("noticeText", noticeText != null ? noticeText : "Formal notice issued citing discrepancy: " + anomaly.getDescription());
        notice.put("responseDeadlineDays", 14);
        notice.put("dispatchedAt", LocalDateTime.now());
        notice.put("status", "PENDING_INSTITUTION_RESPONSE");

        return notice;
    }

    public List<Map<String, Object>> getCategorySummary() {
        List<AnomalyEntity> anomalies = anomalyRepository.findAll();
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
