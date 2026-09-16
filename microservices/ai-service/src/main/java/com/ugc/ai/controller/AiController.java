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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
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

    @PostMapping("/reports/application/{appId}")
    public ResponseEntity<AiReportResponse> saveAppAnalysisReport(@PathVariable("appId") String appId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> payload = body != null ? body : Map.of("applicationId", appId);
        return ResponseEntity.ok(reportGeneratorService.saveReportPayload(payload));
    }

    @PostMapping("/reports/re-evaluate-all")
    public ResponseEntity<List<AiReportResponse>> reEvaluateAllReports(@RequestBody(required = false) Map<String, Object> normPayload) {
        return ResponseEntity.ok(reportGeneratorService.reEvaluateAllReportsWithNorms(normPayload));
    }

    @PostMapping("/self-assessment-report")
    public ResponseEntity<AiReportResponse> saveSelfAssessmentReport(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(reportGeneratorService.saveReportPayload(body));
    }

    @PostMapping("/reports")
    public ResponseEntity<AiReportResponse> saveReport(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(reportGeneratorService.saveReportPayload(body));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<AiReportResponse>> getAllReports() {
        return ResponseEntity.ok(reportGeneratorService.getAllReports());
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
