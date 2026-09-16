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
                // APP-2024-0891 (Engineering)
                NlpParameterEntity.builder().id("101").param("Faculty-Student Ratio").declared("1:15").verified("1:14 (Compliant)").status("PASS").confidence(96).critical(true).applicationId("APP-2024-0891").build(),
                NlpParameterEntity.builder().id("102").param("Built-up Instructional Area").declared("12,500 Sq. Mtrs").verified("12,850 Sq. Mtrs").status("PASS").confidence(95).critical(false).applicationId("APP-2024-0891").build(),
                NlpParameterEntity.builder().id("103").param("Land Title & Ownership Deed").declared("Unencumbered Freehold").verified("Freehold Deed Verified").status("PASS").confidence(99).critical(true).applicationId("APP-2024-0891").build(),
                NlpParameterEntity.builder().id("104").param("Fire Safety NOC Certificate").declared("Valid till Nov 2026").verified("State Fire Service Validated").status("PASS").confidence(98).critical(true).applicationId("APP-2024-0891").build(),

                // APP-2024-0892 (Medical)
                NlpParameterEntity.builder().id("201").param("Hospital Bed Strength").declared("300 Beds").verified("320 Beds Verified").status("PASS").confidence(98).critical(true).applicationId("APP-2024-0892").build(),
                NlpParameterEntity.builder().id("202").param("Clinical Faculty-Student Ratio").declared("1:10").verified("1:9.5 (Compliant)").status("PASS").confidence(97).critical(true).applicationId("APP-2024-0892").build(),
                NlpParameterEntity.builder().id("203").param("Diagnostic Laboratory Standard").declared("NABL Accredited").verified("NABL Certificate Valid").status("PASS").confidence(99).critical(true).applicationId("APP-2024-0892").build(),

                // APP-2024-0893 (Management)
                NlpParameterEntity.builder().id("301").param("Faculty-Student Ratio").declared("1:20").verified("1:26 (Shortfall vs 1:20)").status("MISMATCH").confidence(95).critical(true).applicationId("APP-2024-0893").build(),
                NlpParameterEntity.builder().id("302").param("Executive Classroom Count").declared("6 Smart Halls").verified("4 Halls (Deficit of 2)").status("MISMATCH").confidence(91).critical(false).applicationId("APP-2024-0893").build(),
                NlpParameterEntity.builder().id("303").param("Audited Endowment Fund").declared("₹3.5 Crore").verified("₹3.5 Crore Certified").status("PASS").confidence(97).critical(true).applicationId("APP-2024-0893").build(),

                // APP-2024-0894 (Polytechnic - High Risk)
                NlpParameterEntity.builder().id("401").param("Faculty-Student Ratio").declared("1:20").verified("1:32 (Critical Deficit)").status("MISMATCH").confidence(97).critical(true).applicationId("APP-2024-0894").build(),
                NlpParameterEntity.builder().id("402").param("Machinery & Workshop Equipment").declared("15 Lathe Units").verified("6 Units Operational").status("MISMATCH").confidence(96).critical(true).applicationId("APP-2024-0894").build(),
                NlpParameterEntity.builder().id("403").param("Fire Safety NOC Certificate").declared("Valid till 2025").verified("Expired March 2024").status("MISMATCH").confidence(99).critical(true).applicationId("APP-2024-0894").build(),

                // APP-2024-0895 (Science)
                NlpParameterEntity.builder().id("501").param("Research Laboratory Standards").declared("Spectrometer Active").verified("UV-Vis & FTIR Verified").status("PASS").confidence(98).critical(true).applicationId("APP-2024-0895").build(),
                NlpParameterEntity.builder().id("502").param("Faculty PhD Qualification Rate").declared("75% PhD Holders").verified("78% Verified").status("PASS").confidence(95).critical(false).applicationId("APP-2024-0895").build()
            );
            nlpParameterRepository.saveAll(params);
        }
    }
}
