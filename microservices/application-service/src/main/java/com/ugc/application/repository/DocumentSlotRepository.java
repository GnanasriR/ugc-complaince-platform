package com.ugc.application.repository;

import com.ugc.application.entity.DocumentSlotEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentSlotRepository extends MongoRepository<DocumentSlotEntity, String> {
    List<DocumentSlotEntity> findByApplicationId(String applicationId);
}
