package com.ugc.application.config;

import com.ugc.application.entity.ApplicationEntity;
import com.ugc.application.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ApplicationDataInitializer implements CommandLineRunner {

    private final ApplicationRepository applicationRepository;

    @Override
    public void run(String... args) {
        if (applicationRepository.count() == 0) {
            List<ApplicationEntity> sampleApps = List.of(
                ApplicationEntity.builder().id("APP-2024-0891").name("Rajiv Gandhi Institute of Technology").type("Engineering").regulatoryBody("AICTE").academicYear("2024–25").nlpScore(84.0).risk("Low").mlProb(91.0).status("Approved").state("Karnataka").stage("Completed").daysElapsed(14).cycle("2024–25").submittedAt(LocalDateTime.now()).createdAt(LocalDateTime.now()).build(),
                ApplicationEntity.builder().id("APP-2024-0892").name("Sri Venkateshwara College of Medicine").type("Medical").regulatoryBody("UGC").academicYear("2024–25").nlpScore(92.0).risk("Low").mlProb(96.0).status("Approved").state("Tamil Nadu").stage("Completed").daysElapsed(12).cycle("2024–25").submittedAt(LocalDateTime.now()).createdAt(LocalDateTime.now()).build(),
                ApplicationEntity.builder().id("APP-2024-0893").name("Deccan Institute of Management").type("Management").regulatoryBody("AICTE").academicYear("2024–25").nlpScore(61.0).risk("Medium").mlProb(58.0).status("Under Review").state("Telangana").stage("Expert Review").daysElapsed(42).cycle("2024–25").submittedAt(LocalDateTime.now()).createdAt(LocalDateTime.now()).build(),
                ApplicationEntity.builder().id("APP-2024-0894").name("Sunrise Polytechnic College").type("Polytechnic").regulatoryBody("AICTE").academicYear("2024–25").nlpScore(34.0).risk("High").mlProb(22.0).status("Flagged").state("Maharashtra").stage("Document Verification").daysElapsed(28).cycle("2024–25").submittedAt(LocalDateTime.now()).createdAt(LocalDateTime.now()).build(),
                ApplicationEntity.builder().id("APP-2024-0895").name("Jawaharlal Institute of Sciences").type("Engineering").regulatoryBody("UGC").academicYear("2024–25").nlpScore(78.0).risk("Low").mlProb(83.0).status("Under Review").state("Delhi").stage("Committee").daysElapsed(19).cycle("2024–25").submittedAt(LocalDateTime.now()).createdAt(LocalDateTime.now()).build()
            );
            applicationRepository.saveAll(sampleApps);
        }
    }
}
