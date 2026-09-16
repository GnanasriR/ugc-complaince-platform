package com.ugc.nlp.service;

import com.ugc.nlp.entity.NlpParameterEntity;
import com.ugc.nlp.entity.RegulatoryNormEntity;
import com.ugc.nlp.repository.NlpParameterRepository;
import com.ugc.nlp.repository.RegulatoryNormRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NlpService {

    private final NlpParameterRepository nlpParameterRepository;
    private final RegulatoryNormRepository regulatoryNormRepository;

    public List<NlpParameterEntity> getAllParameters() {
        return nlpParameterRepository.findAll();
    }

    public List<NlpParameterEntity> getParametersByApplicationId(String applicationId) {
        return nlpParameterRepository.findByApplicationId(applicationId);
    }

    public NlpParameterEntity saveParameter(NlpParameterEntity parameter) {
        if (parameter.getApplicationId() == null) {
            parameter.setApplicationId("APP-2024-0891");
        }
        if (parameter.getId() == null) {
            parameter.setId("NLP-" + System.currentTimeMillis() + "-" + (int)(Math.random()*1000));
        }
        return nlpParameterRepository.save(parameter);
    }

    public List<NlpParameterEntity> saveAllParameters(List<NlpParameterEntity> parameters) {
        if (parameters == null || parameters.isEmpty()) return List.of();
        for (NlpParameterEntity param : parameters) {
            if (param.getApplicationId() == null) {
                param.setApplicationId("APP-2024-0891");
            }
            if (param.getId() == null) {
                param.setId("NLP-" + System.currentTimeMillis() + "-" + (int)(Math.random()*1000));
            }
        }
        return nlpParameterRepository.saveAll(parameters);
    }

    public RegulatoryNormEntity saveRegulatoryNorm(RegulatoryNormEntity norm) {
        if (norm == null) return null;
        if (norm.getApplicationId() == null || norm.getApplicationId().isEmpty()) {
            norm.setApplicationId("GLOBAL");
        }
        if (norm.getId() == null) {
            norm.setId("NORM-" + norm.getApplicationId() + "-" + System.currentTimeMillis());
        }
        if (norm.getUploadedAt() == null) {
            norm.setUploadedAt(LocalDateTime.now());
        }
        norm.setStatus("ACTIVE");
        return regulatoryNormRepository.save(norm);
    }

    public RegulatoryNormEntity processAndSaveUploadedNorm(MultipartFile file, String applicationId) {
        try {
            byte[] bytes = file.getBytes();
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "regulatory_norm.pdf";
            String base64 = Base64.getEncoder().encodeToString(bytes);
            
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(bytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            String hash = sb.toString().toUpperCase();

            String text = new String(bytes, StandardCharsets.UTF_8);
            if (text.length() > 50000) text = text.substring(0, 50000);

            RegulatoryNormEntity norm = RegulatoryNormEntity.builder()
                    .id("NORM-" + (applicationId != null ? applicationId : "GLOBAL") + "-" + System.currentTimeMillis())
                    .applicationId(applicationId != null ? applicationId : "GLOBAL")
                    .filename(filename)
                    .fileSize(file.getSize())
                    .fileHash(hash)
                    .fileBase64(base64)
                    .fullExtractedText(text)
                    .rawTextSnippet(text.length() > 500 ? text.substring(0, 500) + "..." : text)
                    .summary("Spring Boot Saved Norm PDF Document for " + filename)
                    .status("ACTIVE")
                    .uploadedAt(LocalDateTime.now())
                    .build();

            return regulatoryNormRepository.save(norm);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store norm in MongoDB via Spring Boot: " + e.getMessage(), e);
        }
    }

    public RegulatoryNormEntity getActiveRegulatoryNorm() {
        return regulatoryNormRepository.findFirstByStatusOrderByUploadedAtDesc("ACTIVE")
                .orElseGet(() -> RegulatoryNormEntity.builder()
                        .id("NORM-DYNAMIC-PENDING")
                        .applicationId("GLOBAL")
                        .filename("No_Norms_Uploaded_Yet.pdf")
                        .applicationType("PENDING_USER_UPLOAD")
                        .summary("No custom PDF regulatory norms uploaded yet. Insert a PDF norm document to dynamically extract regulatory entities.")
                        .status("PENDING_UPLOAD")
                        .uploadedAt(LocalDateTime.now())
                        .build());
    }

    public RegulatoryNormEntity getActiveRegulatoryNormByApplicationId(String applicationId) {
        if (applicationId != null && !applicationId.isEmpty()) {
            Optional<RegulatoryNormEntity> appNorm = regulatoryNormRepository.findFirstByApplicationIdAndStatusOrderByUploadedAtDesc(applicationId, "ACTIVE");
            if (appNorm.isPresent()) return appNorm.get();
        }
        return getActiveRegulatoryNorm();
    }

    public List<RegulatoryNormEntity> getNormsByApplicationId(String applicationId) {
        return regulatoryNormRepository.findByApplicationId(applicationId);
    }

    public RegulatoryNormEntity getRegulatoryNormById(String id) {
        return regulatoryNormRepository.findById(id).orElse(null);
    }

    public List<RegulatoryNormEntity> getAllRegulatoryNorms() {
        return regulatoryNormRepository.findAll();
    }
}
