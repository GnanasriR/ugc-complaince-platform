package com.ugc.analytics.entity;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "reports")
@Getter
@Setter
@NoArgsConstructor
public class Report {

    @Id
    private String id;

    private String reportId;
    private String applicationId;
    private Date generatedAt;
    private String title;
    private Double nlpComplianceScore;
    private Double mlApprovalProbability;
    private String riskTier;
    private String status;
    private String downloadUrl;

}