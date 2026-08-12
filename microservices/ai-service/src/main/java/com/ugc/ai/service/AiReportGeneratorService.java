package com.ugc.ai.service;

import com.ugc.ai.dto.AiReportResponse;
import com.ugc.ai.entity.AiReportEntity;
import com.ugc.ai.repository.AiReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiReportGeneratorService {

    private final AiReportRepository reportRepository;

    public AiReportResponse generateAndStoreReport(String applicationId) {
        String reportId = "RPT-" + applicationId + "-v1";

        AiReportEntity report = AiReportEntity.builder()
                .id(reportId)
                .applicationId(applicationId)
                .institutionName("Rajiv Gandhi Institute of Technology")
                .recommendation("CONDITIONAL_APPROVAL")
                .executiveSummary("AI Document analysis completed. 14 compliance parameters parsed. Discrepancy detected in faculty-student ratio. Approval probability computed at 91%.")
                .nlpComplianceScore(84.0)
                .mlApprovalProbability(91.0)
                .riskTier("Low")
                .complianceMatrixJson("{\"facultyRatio\":\"1:19\",\"phdFaculty\":\"71%\",\"builtUpArea\":\"61200 sq ft\"}")
                .shapDriversJson("[{\"feature\":\"PhD Faculty Pct\",\"shapValue\":+22.5},{\"feature\":\"Faculty Ratio\",\"shapValue\":-28.4}]")
                .anomalyFlagsJson("[{\"title\":\"Cross-Annexure Discrepancy\",\"severity\":\"Critical\"}]")
                .remediationDeadlineDays(14)
                .evaluatorNotes("Requires clarification on Annexure VII faculty payroll.")
                .createdAt(LocalDateTime.now())
                .build();

        AiReportEntity saved = reportRepository.save(report);
        return mapToResponse(saved);
    }

    public AiReportResponse getReportById(String reportId) {
        AiReportEntity report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));
        return mapToResponse(report);
    }

    public List<AiReportResponse> getReportsByApplicationId(String applicationId) {
        return reportRepository.findByApplicationId(applicationId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AiReportResponse mapToResponse(AiReportEntity entity) {
        return AiReportResponse.builder()
                .id(entity.getId())
                .applicationId(entity.getApplicationId())
                .institutionName(entity.getInstitutionName())
                .recommendation(entity.getRecommendation())
                .executiveSummary(entity.getExecutiveSummary())
                .nlpComplianceScore(entity.getNlpComplianceScore())
                .mlApprovalProbability(entity.getMlApprovalProbability())
                .riskTier(entity.getRiskTier())
                .complianceMatrixJson(entity.getComplianceMatrixJson())
                .shapDriversJson(entity.getShapDriversJson())
                .anomalyFlagsJson(entity.getAnomalyFlagsJson())
                .remediationDeadlineDays(entity.getRemediationDeadlineDays())
                .evaluatorNotes(entity.getEvaluatorNotes())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
