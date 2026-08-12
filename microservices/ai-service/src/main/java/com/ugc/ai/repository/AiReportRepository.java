package com.ugc.ai.repository;

import com.ugc.ai.entity.AiReportEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiReportRepository extends MongoRepository<AiReportEntity, String> {
    List<AiReportEntity> findByApplicationId(String applicationId);
}
