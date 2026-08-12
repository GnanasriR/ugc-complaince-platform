package com.ugc.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentInspectionResponse {
    private String id;
    private String applicationId;
    private String fileName;
    private Integer extractedParamsCount;
    private Integer discrepancyCount;
    private Boolean forgeryFlagDetected;
    private List<String> extractedParametersSummary;
    private List<String> detectedDiscrepancies;
}
