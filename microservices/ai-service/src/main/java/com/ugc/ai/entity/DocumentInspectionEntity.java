package com.ugc.ai.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;

@Document(collection = "document_inspections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentInspectionEntity {

    @Id
    private String id;

    private String applicationId;

    private String fileName;

    private Integer extractedParamsCount;

    private Integer discrepancyCount;

    private Boolean forgeryFlagDetected;

    private LocalDateTime inspectedAt;
}
