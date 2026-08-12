package com.ugc.application.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;

@Document(collection = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationEntity {

    @Id
    private String id;

    private String name;

    private String type;

    private String regulatoryBody; // UGC or AICTE

    private String academicYear; // 2024–25, 2025–26

    private String draftPayload; // 5-step form draft state JSON

    private Double nlpScore;

    private String risk;

    private Double mlProb;

    private String status; // DRAFT, SUBMITTED, DOCUMENTS_UPLOADED, NLP_COMPLETE, ML_SCORED, APPROVED, REJECTED, FLAGGED, ESCALATED, PENDING_INSTITUTION_RESPONSE

    private String state;

    private String stage;

    private Integer daysElapsed;

    private String cycle;

    private LocalDateTime submittedAt;

    private LocalDateTime createdAt;
}
