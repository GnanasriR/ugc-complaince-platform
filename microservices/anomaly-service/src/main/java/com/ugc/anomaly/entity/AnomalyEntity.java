package com.ugc.anomaly.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;

@Document(collection = "anomalies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnomalyEntity {

    @Id
    private String id;

    private String title;

    private String description;

    private String severity;

    private String category;

    private Integer confidence;

    private LocalDateTime detectedAt;

    private String affectedApps;
}
