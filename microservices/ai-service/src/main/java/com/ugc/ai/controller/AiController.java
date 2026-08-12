package com.ugc.ai.controller;

import com.ugc.ai.dto.DocumentInspectionRequest;
import com.ugc.ai.dto.DocumentInspectionResponse;
import com.ugc.ai.dto.AiReportResponse;
import com.ugc.ai.service.AiDocumentInspectionService;
import com.ugc.ai.service.AiReportGeneratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiDocumentInspectionService inspectionService;
    private final AiReportGeneratorService reportGeneratorService;

    @PostMapping("/inspect-document")
    public ResponseEntity<DocumentInspectionResponse> inspectDocument(@Valid @RequestBody DocumentInspectionRequest request) {
        return ResponseEntity.ok(inspectionService.inspectDocument(request));
    }

    @PostMapping("/reports/generate/{appId}")
    public ResponseEntity<AiReportResponse> generateAndStoreReport(@PathVariable("appId") String appId) {
        return ResponseEntity.ok(reportGeneratorService.generateAndStoreReport(appId));
    }

    @GetMapping("/reports/{reportId}")
    public ResponseEntity<AiReportResponse> getReportById(@PathVariable("reportId") String reportId) {
        return ResponseEntity.ok(reportGeneratorService.getReportById(reportId));
    }

    @GetMapping("/reports/application/{appId}")
    public ResponseEntity<List<AiReportResponse>> getReportsByApplicationId(@PathVariable("appId") String appId) {
        return ResponseEntity.ok(reportGeneratorService.getReportsByApplicationId(appId));
    }
}
