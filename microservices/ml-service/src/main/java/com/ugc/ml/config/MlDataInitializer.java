package com.ugc.ml.config;

import com.ugc.ml.entity.MlScoreEntity;
import com.ugc.ml.entity.ShapAttributionEntity;
import com.ugc.ml.repository.MlScoreRepository;
import com.ugc.ml.repository.ShapAttributionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MlDataInitializer implements CommandLineRunner {

    private final MlScoreRepository scoreRepository;
    private final ShapAttributionRepository shapRepository;

    @Override
    public void run(String... args) {
        if (scoreRepository.count() == 0) {
            scoreRepository.saveAll(List.of(
                MlScoreEntity.builder().id("1").applicationId("APP-2024-0891").approvalProbability(91.0).riskTier("Low").modelVersion("XGBoost-v2.1.0").scoredAt(LocalDateTime.now()).build(),
                MlScoreEntity.builder().id("2").applicationId("APP-2024-0892").approvalProbability(96.0).riskTier("Low").modelVersion("XGBoost-v2.1.0").scoredAt(LocalDateTime.now()).build(),
                MlScoreEntity.builder().id("3").applicationId("APP-2024-0894").approvalProbability(22.0).riskTier("High").modelVersion("XGBoost-v2.1.0").scoredAt(LocalDateTime.now()).build()
            ));
        }

        if (shapRepository.count() == 0) {
            shapRepository.saveAll(List.of(
                ShapAttributionEntity.builder().id("1").applicationId("APP-2024-0894").featureName("Faculty-Student Ratio").shapValue(-28.4).impactType("NEGATIVE").explanation("Faculty-student ratio 1:19 reduces approval probability by 28.4 points").build(),
                ShapAttributionEntity.builder().id("2").applicationId("APP-2024-0894").featureName("Built-up Area Mismatch").shapValue(-14.2).impactType("NEGATIVE").explanation("Built-up area mismatch of 23,800 sq ft reduces approval by 14.2 points").build(),
                ShapAttributionEntity.builder().id("3").applicationId("APP-2024-0891").featureName("PhD Faculty Percentage").shapValue(+22.5).impactType("POSITIVE").explanation("High PhD faculty percentage (71%) increases score by 22.5 points").build()
            ));
        }
    }
}
