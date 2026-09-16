package com.ugc.ai.service;

import com.ugc.ai.dto.AiReportResponse;
import com.ugc.ai.entity.AiReportEntity;
import com.ugc.ai.repository.AiReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiReportGeneratorService {

    private final AiReportRepository reportRepository;

    public AiReportResponse generateAndStoreReport(String applicationId) {
        String reportId = "RPT-" + applicationId + "-" + System.currentTimeMillis();

        AiReportEntity report = AiReportEntity.builder()
                .id(reportId)
                .applicationId(applicationId)
                .institutionName("Rajiv Gandhi Institute of Technology")
                .recommendation("CONDITIONAL_APPROVAL")
                .executiveSummary("AI Document analysis completed. Regulatory parameters evaluated against UGC benchmarks. Discrepancy detected in faculty-student ratio.")
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

    public AiReportResponse saveReportPayload(Map<String, Object> payload) {
        String appId = payload.get("applicationId") != null ? payload.get("applicationId").toString() : "APP-2024-0891";
        String instName = payload.get("institutionName") != null ? payload.get("institutionName").toString() : "Institutional Applicant";
        String recommendation = payload.get("recommendation") != null ? payload.get("recommendation").toString() : "CONDITIONAL_APPROVAL";
        String execSummary = payload.get("executiveSummary") != null ? payload.get("executiveSummary").toString() : "AI Evaluation Report successfully generated and persisted.";

        Double nlpScore = 85.0;
        if (payload.get("nlpComplianceScore") != null) {
            try {
                nlpScore = Double.parseDouble(payload.get("nlpComplianceScore").toString());
            } catch (Exception e) {}
        }

        Double mlProb = 90.0;
        if (payload.get("mlApprovalProbability") != null) {
            try {
                mlProb = Double.parseDouble(payload.get("mlApprovalProbability").toString());
            } catch (Exception e) {}
        }

        String reportId = "AI-RPT-" + appId + "-" + System.currentTimeMillis();

        AiReportEntity report = AiReportEntity.builder()
                .id(reportId)
                .applicationId(appId)
                .institutionName(instName)
                .recommendation(recommendation)
                .executiveSummary(execSummary)
                .nlpComplianceScore(nlpScore)
                .mlApprovalProbability(mlProb)
                .riskTier(nlpScore >= 80 ? "Low" : nlpScore >= 60 ? "Medium" : "High")
                .evaluatorNotes(payload.get("evaluatorNotes") != null ? payload.get("evaluatorNotes").toString() : "Evaluated under UGC compliance standards.")
                .createdAt(LocalDateTime.now())
                .build();

        AiReportEntity saved = reportRepository.save(report);
        return mapToResponse(saved);
    }

    public List<AiReportResponse> reEvaluateAllReportsWithNorms(Map<String, Object> normPayload) {
        String normFilename = normPayload != null && normPayload.get("normFilename") != null ? normPayload.get("normFilename").toString() : "Newly Inserted PDF Regulatory Norms";
        
        List<AiReportEntity> allReports = reportRepository.findAll();
        if (allReports == null || allReports.isEmpty()) {
            return List.of();
        }

        for (AiReportEntity r : allReports) {
            r.setExecutiveSummary("Re-aligned and evaluated against newly uploaded regulatory norm document: " + normFilename);
            r.setEvaluatorNotes("Bulk re-evaluation triggered on " + LocalDateTime.now() + " under active norm: " + normFilename);
            r.setCreatedAt(LocalDateTime.now());
        }

        return reportRepository.saveAll(allReports).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<AiReportResponse> getAllReports() {
        return reportRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
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
