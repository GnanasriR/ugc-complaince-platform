package com.ugc.ai.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "anomaly-service")
public interface AnomalyClient {

    @GetMapping("/api/v1/anomalies")
    List<Map<String, Object>> getAllAnomalies();
}
