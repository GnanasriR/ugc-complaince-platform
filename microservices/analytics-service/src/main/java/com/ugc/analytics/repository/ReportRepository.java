package com.ugc.analytics.repository;

import com.ugc.analytics.entity.Report;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ReportRepository extends MongoRepository<Report, String> {

    Optional<Report> findByApplicationId(String applicationId);
}