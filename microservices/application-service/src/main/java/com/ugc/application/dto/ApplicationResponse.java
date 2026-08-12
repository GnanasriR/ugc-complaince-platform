package com.ugc.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private String id;
    private String name;
    private String type;
    private String regulatoryBody;
    private String academicYear;
    private String draftPayload;
    private Double nlpScore;
    private String risk;
    private Double mlProb;
    private String status;
    private String state;
    private String stage;
    private Integer daysElapsed;
    private String cycle;
    private LocalDateTime submittedAt;
}
