package com.ugc.ml.controller;

import com.ugc.ml.dto.SelfAssessmentRequest;
import com.ugc.ml.dto.SelfAssessmentResponse;
import com.ugc.ml.entity.MlScoreEntity;
import com.ugc.ml.entity.ShapAttributionEntity;
import com.ugc.ml.service.MlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ml")
@RequiredArgsConstructor
public class MlController {

    private final MlService mlService;

    @GetMapping("/score/{appId}")
    public ResponseEntity<MlScoreEntity> getScore(@PathVariable("appId") String appId) {
        return ResponseEntity.ok(mlService.getScoreByApplicationId(appId));
    }

    @GetMapping("/shap/{appId}")
    public ResponseEntity<List<ShapAttributionEntity>> getShap(@PathVariable("appId") String appId) {
        return ResponseEntity.ok(mlService.getShapAttributions(appId));
    }

    @PostMapping("/pre-check")
    public ResponseEntity<SelfAssessmentResponse> runPreCheck(@RequestBody SelfAssessmentRequest request) {
        return ResponseEntity.ok(mlService.runSelfAssessment(request));
    }
}
