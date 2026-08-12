package com.ugc.ai.repository;

import com.ugc.ai.entity.DocumentInspectionEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentInspectionRepository extends MongoRepository<DocumentInspectionEntity, String> {
    List<DocumentInspectionEntity> findByApplicationId(String applicationId);
}
