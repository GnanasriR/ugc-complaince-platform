package com.ugc.nlp.repository;

import com.ugc.nlp.entity.RegulatoryNormEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegulatoryNormRepository extends MongoRepository<RegulatoryNormEntity, String> {
    Optional<RegulatoryNormEntity> findFirstByStatusOrderByUploadedAtDesc(String status);
    List<RegulatoryNormEntity> findByApplicationId(String applicationId);
    Optional<RegulatoryNormEntity> findFirstByApplicationIdAndStatusOrderByUploadedAtDesc(String applicationId, String status);
}
