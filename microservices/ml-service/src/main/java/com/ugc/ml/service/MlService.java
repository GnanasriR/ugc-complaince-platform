package com.ugc.ml.service;

import com.ugc.ml.dto.SelfAssessmentRequest;
import com.ugc.ml.dto.SelfAssessmentResponse;
import com.ugc.ml.entity.MlScoreEntity;
import com.ugc.ml.entity.ShapAttributionEntity;
import com.ugc.ml.repository.MlScoreRepository;
import com.ugc.ml.repository.ShapAttributionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MlService {

    private final MlScoreRepository scoreRepository;
    private final ShapAttributionRepository shapRepository;

    public MlScoreEntity saveOrUpdateMlScore(MlScoreEntity scoreEntity) {
        if (scoreEntity == null) return null;
        
        String appId = scoreEntity.getApplicationId() != null ? scoreEntity.getApplicationId() : "APP-2024-0891";
        scoreEntity.setApplicationId(appId);

        if (scoreEntity.getScoredAt() == null) {
            scoreEntity.setScoredAt(LocalDateTime.now());
        }
        if (scoreEntity.getModelVersion() == null) {
            scoreEntity.setModelVersion("v2.1-XGBoost");
        }
        if (scoreEntity.getRiskTier() == null && scoreEntity.getApprovalProbability() != null) {
            double prob = scoreEntity.getApprovalProbability();
            scoreEntity.setRiskTier(prob >= 70.0 ? "Low" : (prob >= 45.0 ? "Medium" : "High"));
        }

        Optional<MlScoreEntity> existingOpt = scoreRepository.findByApplicationId(appId);
        if (existingOpt.isPresent()) {
            MlScoreEntity existing = existingOpt.get();
            existing.setApprovalProbability(scoreEntity.getApprovalProbability());
            existing.setRiskTier(scoreEntity.getRiskTier());
            existing.setModelVersion(scoreEntity.getModelVersion());
            existing.setScoredAt(LocalDateTime.now());
            return scoreRepository.save(existing);
        } else {
            if (scoreEntity.getId() == null) {
                scoreEntity.setId("ML-" + appId + "-" + System.currentTimeMillis());
            }
            return scoreRepository.save(scoreEntity);
        }
    }

    public List<MlScoreEntity> getAllScores() {
        return scoreRepository.findAll();
    }

    public MlScoreEntity getScoreByApplicationId(String applicationId) {
        return scoreRepository.findByApplicationId(applicationId)
                .orElseGet(() -> {
                    MlScoreEntity defaultScore = MlScoreEntity.builder()
                            .id("ML-" + applicationId + "-v1")
                            .applicationId(applicationId)
                            .approvalProbability(78.5)
                            .riskTier("Low")
                            .modelVersion("v2.1-XGBoost")
                            .scoredAt(LocalDateTime.now())
                            .build();
                    return scoreRepository.save(defaultScore);
                });
    }

    public List<ShapAttributionEntity> getShapAttributions(String applicationId) {
        List<ShapAttributionEntity> existing = shapRepository.findByApplicationId(applicationId);
        if (existing != null && !existing.isEmpty()) {
            return existing;
        }

        // Generate and persist default SHAP attributions for this application
        List<ShapAttributionEntity> shaps = List.of(
                ShapAttributionEntity.builder().id("SHAP-" + applicationId + "-1").applicationId(applicationId).featureName("PhD Faculty Pct").shapValue(+22.5).impactType("POSITIVE").explanation("PhD faculty percentage above 70% benchmark boosts probability.").build(),
                ShapAttributionEntity.builder().id("SHAP-" + applicationId + "-2").applicationId(applicationId).featureName("Faculty-Student Ratio").shapValue(-28.4).impactType("NEGATIVE").explanation("Ratio 1:19 exceeds benchmark 1:15.").build(),
                ShapAttributionEntity.builder().id("SHAP-" + applicationId + "-3").applicationId(applicationId).featureName("Built-up Area SqFt").shapValue(+12.4).impactType("POSITIVE").explanation("Total land and built-up area satisfies regulatory requirements.").build()
        );
        return shapRepository.saveAll(shaps);
    }

    public List<ShapAttributionEntity> saveShapAttributions(List<ShapAttributionEntity> shaps) {
        if (shaps == null || shaps.isEmpty()) return List.of();
        for (ShapAttributionEntity s : shaps) {
            if (s.getId() == null) {
                s.setId("SHAP-" + (s.getApplicationId() != null ? s.getApplicationId() : "APP") + "-" + System.currentTimeMillis() + "-" + (int)(Math.random()*1000));
            }
        }
        return shapRepository.saveAll(shaps);
    }

    public SelfAssessmentResponse runSelfAssessment(SelfAssessmentRequest request) {
        double score = 82.0;
        List<String> recommendations = new ArrayList<>();
        List<String> positiveFactors = new ArrayList<>();
        List<String> riskFactors = new ArrayList<>();

        if (request.getPhdFacultyPct() != null && request.getPhdFacultyPct() >= 70) {
            score += 8.0;
            positiveFactors.add("High PhD faculty percentage (" + request.getPhdFacultyPct() + "%) boosts approval.");
        } else {
            score -= 10.0;
            riskFactors.add("PhD faculty percentage below 70%.");
            recommendations.add("Increase PhD faculty representation above 70% to gain +12 approval points.");
        }

        if (request.getFacultyStudentRatio() != null && request.getFacultyStudentRatio().contains("1:15")) {
            score += 5.0;
            positiveFactors.add("Compliant faculty-student ratio (1:15).");
        } else if (request.getFacultyStudentRatio() != null && request.getFacultyStudentRatio().contains("1:19")) {
            score -= 15.0;
            riskFactors.add("Faculty-student ratio 1:19 exceeds benchmark 1:15.");
            recommendations.add("Recruit 4 additional faculty to achieve 1:15 ratio.");
        }

        score = Math.max(0.0, Math.min(100.0, score));
        String riskTier = score >= 70 ? "Low" : (score >= 45 ? "Medium" : "High");
        String appId = request.getApplicationId() != null ? request.getApplicationId() : "APP-2024-0891";

        saveOrUpdateMlScore(MlScoreEntity.builder()
                .applicationId(appId)
                .approvalProbability(score)
                .riskTier(riskTier)
                .modelVersion("v2.1-XGBoost")
                .scoredAt(LocalDateTime.now())
                .build());

        getShapAttributions(appId);

        return SelfAssessmentResponse.builder()
                .simulatedApprovalProbability(score)
                .riskTier(riskTier)
                .topRecommendations(recommendations)
                .positiveFactors(positiveFactors)
                .riskFactors(riskFactors)
                .build();
    }
}
