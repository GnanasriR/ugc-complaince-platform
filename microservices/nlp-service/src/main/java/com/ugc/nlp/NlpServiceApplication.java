package com.ugc.nlp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class NlpServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(NlpServiceApplication.class, args);
    }
}
