package com.ugc.ml;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MlServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MlServiceApplication.class, args);
    }
}
