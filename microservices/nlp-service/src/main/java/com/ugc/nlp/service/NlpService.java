package com.ugc.nlp.service;

import com.ugc.nlp.entity.NlpParameterEntity;
import com.ugc.nlp.repository.NlpParameterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NlpService {

    private final NlpParameterRepository nlpParameterRepository;

    public List<NlpParameterEntity> getAllParameters() {
        return nlpParameterRepository.findAll();
    }

    public List<NlpParameterEntity> getParametersByApplicationId(String applicationId) {
        return nlpParameterRepository.findByApplicationId(applicationId);
    }
}
