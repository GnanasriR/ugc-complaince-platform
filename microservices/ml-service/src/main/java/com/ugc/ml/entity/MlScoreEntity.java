package com.ugc.ml.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;

@Document(collection = "ml_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MlScoreEntity {

    @Id
    private String id;

    private String applicationId;

    private Double approvalProbability;

    private String riskTier; // Low (>=70%), Medium (45-69%), High (<45%)

    private String modelVersion;

    private LocalDateTime scoredAt;
}
