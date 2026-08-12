package com.ugc.ml.repository;

import com.ugc.ml.entity.MlScoreEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MlScoreRepository extends MongoRepository<MlScoreEntity, String> {
    Optional<MlScoreEntity> findByApplicationId(String applicationId);
}
