package com.ugc.nlp.config;

import com.ugc.nlp.entity.NlpParameterEntity;
import com.ugc.nlp.repository.NlpParameterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class NlpDataInitializer implements CommandLineRunner {

    private final NlpParameterRepository nlpParameterRepository;

    @Override
    public void run(String... args) {
        if (nlpParameterRepository.count() == 0) {
            List<NlpParameterEntity> params = List.of(
                NlpParameterEntity.builder().id("1").param("Faculty–Student Ratio").declared("1:12").verified("1:19").status("MISMATCH").confidence(97).critical(true).applicationId("APP-2024-0894").build(),
                NlpParameterEntity.builder().id("2").param("PhD Faculty Percentage").declared("68%").verified("71%").status("PASS").confidence(94).critical(false).applicationId("APP-2024-0891").build(),
                NlpParameterEntity.builder().id("3").param("Built-up Area (sq. ft.)").declared("85,000").verified("61,200").status("MISMATCH").confidence(89).critical(true).applicationId("APP-2024-0901").build(),
                NlpParameterEntity.builder().id("4").param("Library Holdings (vols.)").declared("45,000").verified("28,340").status("MISMATCH").confidence(92).critical(true).applicationId("APP-2024-0898").build(),
                NlpParameterEntity.builder().id("5").param("Computer Lab Capacity").declared("480 seats").verified("480 seats").status("PASS").confidence(98).critical(false).applicationId("APP-2024-0891").build()
            );
            nlpParameterRepository.saveAll(params);
        }
    }
}
