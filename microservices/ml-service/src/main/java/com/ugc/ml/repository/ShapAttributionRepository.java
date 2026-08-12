package com.ugc.ml.repository;

import com.ugc.ml.entity.ShapAttributionEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShapAttributionRepository extends MongoRepository<ShapAttributionEntity, String> {
    List<ShapAttributionEntity> findByApplicationId(String applicationId);
}
