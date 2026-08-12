package com.ugc.analytics.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.ugc.analytics.entity.Analytics;
import com.ugc.analytics.entity.Report;
import com.ugc.analytics.repository.AnalyticsRepository;
import com.ugc.analytics.repository.ReportRepository;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final ReportRepository reportRepository;

    public AnalyticsService(AnalyticsRepository analyticsRepository , ReportRepository reportRepository) {
        this.analyticsRepository = analyticsRepository;
        this.reportRepository = reportRepository;
    }

    // =========================
    // Pipeline Stages - MongoDB
    // =========================
    public List<Map<String, Object>> getPipelineStages() {

        List<Analytics> analytics =
                analyticsRepository.findByType("pipeline");

        return analytics.stream()
                .map(data -> {

                    Map<String, Object> result = new HashMap<>();

                    result.put("stage", data.getName());
                    result.put("count", data.getCount());
                    result.put("pct", data.getPercentage());
                    result.put("color", getStageColor(data.getName()));

                    return result;
                })
                .toList();
    }

    private String getStageColor(String stage) {

        return switch (stage) {

            case "Submission" ->
                    "#0D9488";

            case "Doc Verification" ->
                    "#10B981";

            case "Expert Review" ->
                    "#0F766E";

            case "Committee" ->
                    "#D97706";

            case "Final Decision" ->
                    "#059669";

            default ->
                    "#6B7280";
        };
    }

    // =========================
    // Compliance By Type
    // =========================
    public List<Map<String, Object>> getComplianceByType() {

        List<Analytics> analytics =
                analyticsRepository.findByType("compliance");

        return analytics.stream()
                .map(data -> {

                    Map<String, Object> result = new HashMap<>();

                    result.put("type", data.getName());
                    result.put("rate", data.getPercentage());

                    return result;
                })
                .toList();
    }

    // =========================
    // Trend Data
    // =========================
    public List<Map<String, Object>> getTrendData() {

        List<Analytics> analytics =
                analyticsRepository.findByType("trend");

        return analytics.stream()
                .map(data -> {

                    Map<String, Object> result = new HashMap<>();

                    result.put("month", data.getName());
                    result.put("apps", data.getCount());
                    result.put("approved", data.getPercentage());

                    return result;
                })
                .toList();
    }
    // =========================
    // Evaluator Consistency
    // =========================
    public List<Map<String, Object>> getEvaluatorConsistencyMetrics() {

        List<Analytics> analytics =
                analyticsRepository.findByType("evaluator");

        return analytics.stream()
                .map(data -> {

                    Map<String, Object> result = new HashMap<>();

                    result.put("evaluatorPair", data.getName());
                    result.put("category", data.getCategory());
                    result.put("cohensKappa", data.getPercentage());

                    String status =
                            data.getPercentage() >= 0.80
                                    ? "CALIBRATED"
                                    : "CALIBRATION_REQUIRED";

                    result.put("status", status);

                    return result;
                })
                .toList();
    }
   
    // =========================
    // PDF Report
    // =========================
    public Map<String, Object> generatePdfReport(String applicationId) {

        Report report = reportRepository
                .findByApplicationId(applicationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Report not found for application: "
                                        + applicationId));

        Map<String, Object> result = new HashMap<>();

        result.put("reportId", report.getReportId());
        result.put("applicationId", report.getApplicationId());
        result.put("generatedAt", report.getGeneratedAt());
        result.put("title", report.getTitle());
        result.put("nlpComplianceScore", report.getNlpComplianceScore());
        result.put("mlApprovalProbability",
                report.getMlApprovalProbability());
        result.put("riskTier", report.getRiskTier());
        result.put("status", report.getStatus());
        result.put("downloadUrl", report.getDownloadUrl());

        return result;
    }
}