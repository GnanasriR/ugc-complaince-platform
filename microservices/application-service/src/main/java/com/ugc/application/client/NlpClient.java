package com.ugc.application.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "nlp-service")
public interface NlpClient {

    @GetMapping("/api/v1/nlp/parameters")
    List<Map<String, Object>> getAllParameters();
}
