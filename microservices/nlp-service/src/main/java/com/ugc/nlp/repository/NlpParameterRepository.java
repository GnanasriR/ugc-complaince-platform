package com.ugc.nlp.repository;

import com.ugc.nlp.entity.NlpParameterEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NlpParameterRepository extends MongoRepository<NlpParameterEntity, String> {
    List<NlpParameterEntity> findByApplicationId(String applicationId);
    List<NlpParameterEntity> findByStatus(String status);
}
