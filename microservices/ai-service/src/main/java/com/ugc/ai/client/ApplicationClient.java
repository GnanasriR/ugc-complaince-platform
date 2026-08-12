package com.ugc.ai.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "application-service")
public interface ApplicationClient {

    @GetMapping("/api/v1/applications/{id}")
    Map<String, Object> getApplicationById(@PathVariable("id") String id);
}
