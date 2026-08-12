package com.ugc.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiReportResponse {
    private String id;
    private String applicationId;
    private String institutionName;
    private String recommendation;
    private String executiveSummary;
    private Double nlpComplianceScore;
    private Double mlApprovalProbability;
    private String riskTier;
    private String complianceMatrixJson;
    private String shapDriversJson;
    private String anomalyFlagsJson;
    private Integer remediationDeadlineDays;
    private String evaluatorNotes;
    private LocalDateTime createdAt;
}
