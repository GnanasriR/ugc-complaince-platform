package com.ugc.nlp.controller;

import com.ugc.nlp.entity.NlpParameterEntity;
import com.ugc.nlp.entity.RegulatoryNormEntity;
import com.ugc.nlp.service.NlpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/nlp")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
@RequiredArgsConstructor
public class NlpController {

    private final NlpService nlpService;

    @GetMapping("/parameters")
    public ResponseEntity<List<NlpParameterEntity>> getAllParameters() {
        return ResponseEntity.ok(nlpService.getAllParameters());
    }

    @GetMapping("/parameters/application/{appId}")
    public ResponseEntity<List<NlpParameterEntity>> getParametersByApplication(@PathVariable("appId") String appId) {
        return ResponseEntity.ok(nlpService.getParametersByApplicationId(appId));
    }

    @PostMapping("/parameter")
    public ResponseEntity<NlpParameterEntity> saveParameter(@RequestBody NlpParameterEntity parameter) {
        return ResponseEntity.ok(nlpService.saveParameter(parameter));
    }

    @PostMapping({"/parameters", "/parameters/batch"})
    public ResponseEntity<List<NlpParameterEntity>> saveAllParameters(@RequestBody List<NlpParameterEntity> parameters) {
        return ResponseEntity.ok(nlpService.saveAllParameters(parameters));
    }

    @GetMapping("/norms")
    public ResponseEntity<List<RegulatoryNormEntity>> getAllNorms() {
        return ResponseEntity.ok(nlpService.getAllRegulatoryNorms());
    }

    @GetMapping("/norms/active")
    public ResponseEntity<RegulatoryNormEntity> getActiveNorm() {
        return ResponseEntity.ok(nlpService.getActiveRegulatoryNorm());
    }

    @GetMapping("/norms/active/application/{appId}")
    public ResponseEntity<RegulatoryNormEntity> getActiveNormByApplication(@PathVariable("appId") String appId) {
        RegulatoryNormEntity norm = nlpService.getActiveRegulatoryNormByApplicationId(appId);
        return ResponseEntity.ok(norm != null ? norm : nlpService.getActiveRegulatoryNorm());
    }

    @GetMapping("/norms/application/{appId}")
    public ResponseEntity<List<RegulatoryNormEntity>> getNormsByApplication(@PathVariable("appId") String appId) {
        return ResponseEntity.ok(nlpService.getNormsByApplicationId(appId));
    }

    @GetMapping("/norms/{id}")
    public ResponseEntity<RegulatoryNormEntity> getNormById(@PathVariable("id") String id) {
        return ResponseEntity.ok(nlpService.getRegulatoryNormById(id));
    }

    @PostMapping("/norms")
    public ResponseEntity<RegulatoryNormEntity> saveNorm(@RequestBody RegulatoryNormEntity norm) {
        return ResponseEntity.ok(nlpService.saveRegulatoryNorm(norm));
    }

    @PostMapping(value = "/norms/upload", consumes = "multipart/form-data")
    public ResponseEntity<RegulatoryNormEntity> uploadNormDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "applicationId", required = false, defaultValue = "GLOBAL") String applicationId) {
        return ResponseEntity.ok(nlpService.processAndSaveUploadedNorm(file, applicationId));
    }
}
