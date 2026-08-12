package com.ugc.nlp.controller;

import com.ugc.nlp.entity.NlpParameterEntity;
import com.ugc.nlp.service.NlpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/nlp")
@RequiredArgsConstructor
public class NlpController {

    private final NlpService nlpService;

    @GetMapping("/parameters")
    public ResponseEntity<List<NlpParameterEntity>> getAllParameters() {
        return ResponseEntity.ok(nlpService.getAllParameters());
    }

    @GetMapping("/parameters/application/{appId}")
    public ResponseEntity<List<NlpParameterEntity>> getParametersByApplication(@PathVariable("appId") String appId) {
        return ResponseEntity.ok(nlpService.getParametersByApplicationId(appId));
    }
}
