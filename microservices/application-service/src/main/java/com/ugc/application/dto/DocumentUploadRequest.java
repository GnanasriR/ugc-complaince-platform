package com.ugc.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DocumentUploadRequest {
    @NotBlank(message = "Slot name is required")
    private String slotName;

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File type must be PDF or DOCX")
    private String fileType;

    private Long fileSize;

    @NotBlank(message = "File SHA-256 hash is required")
    private String fileHash;
}
