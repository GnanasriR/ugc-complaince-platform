package com.ugc.anomaly.config;

import com.ugc.anomaly.entity.AnomalyEntity;
import com.ugc.anomaly.repository.AnomalyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AnomalyDataInitializer implements CommandLineRunner {

    private final AnomalyRepository anomalyRepository;

    @Override
    public void run(String... args) {
        if (anomalyRepository.count() == 0) {
            List<AnomalyEntity> anomalies = List.of(
                AnomalyEntity.builder().id("ANO-2024-0041").title("Cross-Annexure Data Inconsistency").description("Faculty headcount in Annexure III (68 staff) contradicts Annexure VII payroll register (38 confirmed). Discrepancy of 30 faculty members with no explanatory note.").severity("Critical").category("Data Integrity").confidence(97).detectedAt(LocalDateTime.now()).affectedApps("APP-2024-0894,APP-2024-0898,APP-2024-0901").build(),
                AnomalyEntity.builder().id("ANO-2024-0042").title("Document Metadata Forgery Signal").description("PDF creation timestamp (2024-09-03) predates the notarisation date (2024-09-10). File hash mismatch detected against registry submission.").severity("Critical").category("Document Integrity").confidence(94).detectedAt(LocalDateTime.now()).affectedApps("APP-2024-0898").build(),
                AnomalyEntity.builder().id("ANO-2024-0043").title("Financial Cap Violation (Fee Regulation Act)").description("Fee structure declared in Form-7 (₹1,95,000/yr) exceeds the state-regulated cap of ₹1,40,000/yr for management programmes without NAAC A+.").severity("High").category("Regulatory Breach").confidence(99).detectedAt(LocalDateTime.now()).affectedApps("APP-2024-0897").build()
            );
            anomalyRepository.saveAll(anomalies);
        }
    }
}
