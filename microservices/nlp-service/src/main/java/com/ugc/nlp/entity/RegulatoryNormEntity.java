package com.ugc.nlp.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "regulatory_norms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegulatoryNormEntity {

    @Id
    private String id;

    private String applicationId;

    private String filename;

    private String applicationType;

    private Long fileSize;

    private String fileHash;

    private String fileBase64;

    private String fullExtractedText;

    private String rawTextSnippet;

    private String summary;

    private List<Map<String, Object>> extractedNormEntities;

    private Map<String, Object> normParametersMap;

    private List<String> requiredDocumentChecklist;

    private String status;

    private LocalDateTime uploadedAt;
}
