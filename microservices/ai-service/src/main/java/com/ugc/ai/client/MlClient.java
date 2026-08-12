package com.ugc.ai.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "ml-service")
public interface MlClient {

    @GetMapping("/api/v1/ml/score/{appId}")
    Map<String, Object> getMlScore(@PathVariable("appId") String appId);

    @GetMapping("/api/v1/ml/shap/{appId}")
    List<Object> getShapAttributions(@PathVariable("appId") String appId);
}
