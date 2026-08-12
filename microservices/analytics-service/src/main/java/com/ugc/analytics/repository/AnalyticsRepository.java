package com.ugc.analytics.repository;

import com.ugc.analytics.entity.Analytics;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AnalyticsRepository extends MongoRepository<Analytics, String> {

    List<Analytics> findByType(String type);
}