package com.ugc.application.service;

import com.ugc.application.dto.*;
import com.ugc.application.entity.ApplicationEntity;
import com.ugc.application.entity.DocumentSlotEntity;
import com.ugc.application.repository.ApplicationRepository;
import com.ugc.application.repository.DocumentSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final DocumentSlotRepository documentSlotRepository;

    public List<ApplicationResponse> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ApplicationResponse getApplicationById(String id) {
        ApplicationEntity app = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + id));
        return mapToResponse(app);
    }

    public ApplicationResponse createApplication(ApplicationCreateRequest request) {
        String prefix = request.getRegulatoryBody().toUpperCase().startsWith("AICTE") ? "AICTE" : "UGC";
        String year = request.getAcademicYear().split("–")[0].split("-")[0];
        String generatedId = prefix + "-" + year + "-" + String.format("%05d", new Random().nextInt(90000) + 10000);

        ApplicationEntity entity = ApplicationEntity.builder()
                .id(generatedId)
                .name(request.getName())
                .type(request.getType())
                .regulatoryBody(prefix)
                .academicYear(request.getAcademicYear())
                .state(request.getState())
                .cycle(request.getAcademicYear())
                .status("DRAFT")
                .stage("Drafting Form")
                .risk("Pending")
                .nlpScore(0.0)
                .mlProb(0.0)
                .daysElapsed(0)
                .submittedAt(LocalDateTime.now())
                .build();

        ApplicationEntity saved = applicationRepository.save(entity);
        return mapToResponse(saved);
    }

    public ApplicationResponse autoSaveDraft(String id, String draftPayload) {
        ApplicationEntity app = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + id));

        app.setDraftPayload(draftPayload);
        app.setStage("Form In Progress");
        ApplicationEntity saved = applicationRepository.save(app);
        return mapToResponse(saved);
    }

    public ApplicationResponse submitApplication(String id) {
        ApplicationEntity app = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + id));

        app.setStatus("SUBMITTED");
        app.setStage("Document Upload");
        app.setSubmittedAt(LocalDateTime.now());
        ApplicationEntity saved = applicationRepository.save(app);
        return mapToResponse(saved);
    }

    public DocumentSlotEntity uploadDocument(String id, DocumentUploadRequest request) {
        if (!request.getFileType().equalsIgnoreCase("PDF") && !request.getFileType().equalsIgnoreCase("DOCX")) {
            throw new IllegalArgumentException("Only PDF and DOCX files are accepted.");
        }
        if (request.getFileSize() != null && request.getFileSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File too large. Maximum size is 10MB.");
        }

        DocumentSlotEntity slot = DocumentSlotEntity.builder()
                .applicationId(id)
                .slotName(request.getSlotName())
                .fileName(request.getFileName())
                .fileType(request.getFileType().toUpperCase())
                .fileSize(request.getFileSize())
                .fileHash(request.getFileHash())
                .build();

        DocumentSlotEntity saved = documentSlotRepository.save(slot);

        // Check if all slots uploaded and update status
        ApplicationEntity app = applicationRepository.findById(id).orElse(null);
        if (app != null) {
            app.setStatus("DOCUMENTS_UPLOADED");
            app.setStage("NLP Document Verification");
            applicationRepository.save(app);
        }

        return saved;
    }

    public List<DocumentSlotEntity> getDocuments(String id) {
        return documentSlotRepository.findByApplicationId(id);
    }

    public ApplicationResponse updateStatus(String id, StatusUpdateRequest request) {
        ApplicationEntity app = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + id));

        app.setStatus(request.getStatus());
        if (request.getStage() != null && !request.getStage().isBlank()) {
            app.setStage(request.getStage());
        }

        ApplicationEntity saved = applicationRepository.save(app);
        return mapToResponse(saved);
    }

    private ApplicationResponse mapToResponse(ApplicationEntity entity) {
        return ApplicationResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .type(entity.getType())
                .regulatoryBody(entity.getRegulatoryBody())
                .academicYear(entity.getAcademicYear())
                .draftPayload(entity.getDraftPayload())
                .nlpScore(entity.getNlpScore())
                .risk(entity.getRisk())
                .mlProb(entity.getMlProb())
                .status(entity.getStatus())
                .state(entity.getState())
                .stage(entity.getStage())
                .daysElapsed(entity.getDaysElapsed())
                .cycle(entity.getCycle())
                .submittedAt(entity.getSubmittedAt())
                .build();
    }
}
