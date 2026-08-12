package com.ugc.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplicationCreateRequest {
    @NotBlank(message = "Institution name is required")
    private String name;

    @NotBlank(message = "Application type is required")
    private String type;

    @NotBlank(message = "Regulatory body is required (UGC/AICTE)")
    private String regulatoryBody;

    @NotBlank(message = "State is required")
    private String state;

    private String academicYear = "2025–26";
}
