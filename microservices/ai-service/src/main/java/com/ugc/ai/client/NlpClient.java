package com.ugc.ai.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "nlp-service")
public interface NlpClient {

    @GetMapping("/api/v1/nlp/parameters/application/{appId}")
    List<Object> getParametersByApplication(@PathVariable("appId") String appId);
}
