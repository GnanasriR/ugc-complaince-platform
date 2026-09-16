package com.ugc.analytics.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    private String id;

    private String reportId;
    private String applicationId;
    private Object generatedAt;
    private String title;
    private Double nlpComplianceScore;
    private Double mlApprovalProbability;
    private String riskTier;
    private String status;
    private String downloadUrl;
    private String type;
    private String format;
    private String generatedBy;
    private Integer recordsCount;
}