package com.ugc.application.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;

@Document(collection = "document_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentSlotEntity {

    @Id
    private String id;

    private String applicationId;

    private String slotName;

    private String fileName;

    private String fileType; // PDF, DOCX

    private Long fileSize;

    private String fileHash; // SHA-256 hash

    private LocalDateTime uploadedAt;
}
