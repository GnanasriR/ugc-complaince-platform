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
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
@RequiredArgsConstructor
public class MlController {

    private final MlService mlService;

    @GetMapping("/scores")
    public ResponseEntity<List<MlScoreEntity>> getAllScores() {
        return ResponseEntity.ok(mlService.getAllScores());
    }

    @GetMapping("/score/{appId}")
    public ResponseEntity<MlScoreEntity> getScore(@PathVariable("appId") String appId) {
        return ResponseEntity.ok(mlService.getScoreByApplicationId(appId));
    }

    @PostMapping("/score")
    public ResponseEntity<MlScoreEntity> saveScore(@RequestBody MlScoreEntity scoreEntity) {
        return ResponseEntity.ok(mlService.saveOrUpdateMlScore(scoreEntity));
    }

    @PostMapping("/score/application/{appId}")
    public ResponseEntity<MlScoreEntity> saveAppScore(@PathVariable("appId") String appId, @RequestBody MlScoreEntity scoreEntity) {
        if (scoreEntity != null) {
            scoreEntity.setApplicationId(appId);
        } else {
            scoreEntity = MlScoreEntity.builder().applicationId(appId).approvalProbability(85.0).riskTier("Low").build();
        }
        return ResponseEntity.ok(mlService.saveOrUpdateMlScore(scoreEntity));
    }

    @GetMapping("/shap/{appId}")
    public ResponseEntity<List<ShapAttributionEntity>> getShap(@PathVariable("appId") String appId) {
        return ResponseEntity.ok(mlService.getShapAttributions(appId));
    }

    @PostMapping({"/shap", "/shap/batch"})
    public ResponseEntity<List<ShapAttributionEntity>> saveShapBatch(@RequestBody List<ShapAttributionEntity> shaps) {
        return ResponseEntity.ok(mlService.saveShapAttributions(shaps));
    }

    @PostMapping("/pre-check")
    public ResponseEntity<SelfAssessmentResponse> runPreCheck(@RequestBody SelfAssessmentRequest request) {
        return ResponseEntity.ok(mlService.runSelfAssessment(request));
    }
}
