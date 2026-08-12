package com.ugc.ml.dto;

import lombok.Data;

@Data
public class SelfAssessmentRequest {
    private String facultyStudentRatio;
    private Double phdFacultyPct;
    private Double builtUpAreaSqFt;
    private Integer libraryVolumes;
    private String feeStructure;
}
