package com.ugc.application.repository;

import com.ugc.application.entity.ApplicationEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends MongoRepository<ApplicationEntity, String> {
    List<ApplicationEntity> findByStatus(String status);
    List<ApplicationEntity> findByRisk(String risk);
    List<ApplicationEntity> findByType(String type);
    List<ApplicationEntity> findByState(String state);
}
