package com.ugc.ai.config;

import com.ugc.ai.entity.AiReportEntity;
import com.ugc.ai.repository.AiReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AiDataInitializer implements CommandLineRunner {

    private final AiReportRepository reportRepository;

    @Override
    public void run(String... args) {
        if (reportRepository.count() == 0) {
            reportRepository.saveAll(List.of(
                AiReportEntity.builder()
                        .id("RPT-APP-2024-0891-v1")
                        .applicationId("APP-2024-0891")
                        .institutionName("Rajiv Gandhi Institute of Technology")
                        .recommendation("APPROVED")
                        .executiveSummary("AI Document inspection complete. 100% compliance across faculty-student ratio and PhD qualifications. Approval probability 91%.")
                        .nlpComplianceScore(84.0)
                        .mlApprovalProbability(91.0)
                        .riskTier("Low")
                        .complianceMatrixJson("{\"facultyRatio\":\"1:12\",\"phdFaculty\":\"71%\"}")
                        .shapDriversJson("[{\"feature\":\"PhD Faculty Pct\",\"shapValue\":+22.5}]")
                        .anomalyFlagsJson("[]")
                        .remediationDeadlineDays(0)
                        .evaluatorNotes("Cleared for final UGC approval.")
                        .createdAt(LocalDateTime.now())
                        .build()
            ));
        }
    }
}
