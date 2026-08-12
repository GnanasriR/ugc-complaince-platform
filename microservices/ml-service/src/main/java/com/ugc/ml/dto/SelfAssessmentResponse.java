package com.ugc.ml.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelfAssessmentResponse {
    private Double simulatedApprovalProbability;
    private String riskTier;
    private List<String> topRecommendations;
    private List<String> positiveFactors;
    private List<String> riskFactors;
}
