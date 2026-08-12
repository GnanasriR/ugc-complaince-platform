package com.ugc.application.controller;

import com.ugc.application.dto.*;
import com.ugc.application.entity.DocumentSlotEntity;
import com.ugc.application.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getApplicationById(@PathVariable("id") String id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> createApplication(@Valid @RequestBody ApplicationCreateRequest request) {
        return ResponseEntity.ok(applicationService.createApplication(request));
    }

    @PatchMapping("/{id}/draft")
    public ResponseEntity<ApplicationResponse> autoSaveDraft(@PathVariable("id") String id, @RequestBody String draftPayload) {
        return ResponseEntity.ok(applicationService.autoSaveDraft(id, draftPayload));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApplicationResponse> submitApplication(@PathVariable("id") String id) {
        return ResponseEntity.ok(applicationService.submitApplication(id));
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<DocumentSlotEntity> uploadDocument(@PathVariable("id") String id, @Valid @RequestBody DocumentUploadRequest request) {
        return ResponseEntity.ok(applicationService.uploadDocument(id, request));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<DocumentSlotEntity>> getDocuments(@PathVariable("id") String id) {
        return ResponseEntity.ok(applicationService.getDocuments(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(@PathVariable("id") String id, @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(applicationService.updateStatus(id, request));
    }
}
