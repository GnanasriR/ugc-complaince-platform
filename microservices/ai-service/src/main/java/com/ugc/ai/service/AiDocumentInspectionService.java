package com.ugc.ai.service;

import com.ugc.ai.dto.DocumentInspectionRequest;
import com.ugc.ai.dto.DocumentInspectionResponse;
import com.ugc.ai.entity.DocumentInspectionEntity;
import com.ugc.ai.repository.DocumentInspectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiDocumentInspectionService {

    private final DocumentInspectionRepository inspectionRepository;

    public DocumentInspectionResponse inspectDocument(DocumentInspectionRequest request) {
        String text = request.getDocumentTextContent() != null ? request.getDocumentTextContent().toLowerCase() : "";
        boolean forgeryDetected = text.contains("forgery") || text.contains("tampered") || text.contains("mismatch");

        DocumentInspectionEntity entity = DocumentInspectionEntity.builder()
                .applicationId(request.getApplicationId())
                .fileName(request.getFileName())
                .extractedParamsCount(14)
                .discrepancyCount(forgeryDetected ? 2 : 0)
                .forgeryFlagDetected(forgeryDetected)
                .inspectedAt(LocalDateTime.now())
                .build();

        DocumentInspectionEntity saved = inspectionRepository.save(entity);

        return DocumentInspectionResponse.builder()
                .id(saved.getId())
                .applicationId(saved.getApplicationId())
                .fileName(saved.getFileName())
                .extractedParamsCount(saved.getExtractedParamsCount())
                .discrepancyCount(saved.getDiscrepancyCount())
                .forgeryFlagDetected(saved.getForgeryFlagDetected())
                .extractedParametersSummary(List.of("Faculty-Student Ratio: 1:19 (Verified)", "PhD Faculty: 71%", "Built-up Area: 61,200 sq ft"))
                .detectedDiscrepancies(forgeryDetected ? List.of("Faculty headcount mismatch across Annexure III and VII") : List.of())
                .build();
    }
}
