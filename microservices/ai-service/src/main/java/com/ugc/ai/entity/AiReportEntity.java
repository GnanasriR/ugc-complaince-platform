package com.ugc.ai.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;

@Document(collection = "ai_evaluation_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiReportEntity {

    @Id
    private String id;

    private String applicationId;

    private String institutionName;

    private String recommendation; // APPROVED, CONDITIONAL_APPROVAL, REJECTED

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
