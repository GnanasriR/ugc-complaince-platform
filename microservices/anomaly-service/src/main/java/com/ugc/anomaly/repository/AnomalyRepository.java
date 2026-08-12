package com.ugc.anomaly.repository;

import com.ugc.anomaly.entity.AnomalyEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnomalyRepository extends MongoRepository<AnomalyEntity, String> {
    List<AnomalyEntity> findBySeverity(String severity);
    List<AnomalyEntity> findByCategory(String category);
}
