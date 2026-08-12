package com.ugc.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DocumentInspectionRequest {
    @NotBlank(message = "Application ID is required")
    private String applicationId;

    @NotBlank(message = "File name is required")
    private String fileName;

    private String documentTextContent;
}
