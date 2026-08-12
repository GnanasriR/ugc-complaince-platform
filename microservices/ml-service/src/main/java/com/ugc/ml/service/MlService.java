package com.ugc.ml.service;

import com.ugc.ml.dto.SelfAssessmentRequest;
import com.ugc.ml.dto.SelfAssessmentResponse;
import com.ugc.ml.entity.MlScoreEntity;
import com.ugc.ml.entity.ShapAttributionEntity;
import com.ugc.ml.repository.MlScoreRepository;
import com.ugc.ml.repository.ShapAttributionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MlService {

    private final MlScoreRepository scoreRepository;
    private final ShapAttributionRepository shapRepository;

    public MlScoreEntity getScoreByApplicationId(String applicationId) {
        return scoreRepository.findByApplicationId(applicationId)
                .orElseGet(() -> MlScoreEntity.builder()
                        .applicationId(applicationId)
                        .approvalProbability(78.5)
                        .riskTier("Low")
                        .build());
    }

    public List<ShapAttributionEntity> getShapAttributions(String applicationId) {
        return shapRepository.findByApplicationId(applicationId);
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

        return SelfAssessmentResponse.builder()
                .simulatedApprovalProbability(score)
                .riskTier(riskTier)
                .topRecommendations(recommendations)
                .positiveFactors(positiveFactors)
                .riskFactors(riskFactors)
                .build();
    }
}
