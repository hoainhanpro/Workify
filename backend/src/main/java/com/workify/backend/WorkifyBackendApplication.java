package com.workify.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import com.workify.backend.config.JwtProperties;
import com.workify.backend.config.CorsProperties;

@SpringBootApplication
@EnableMongoAuditing
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class})
public class WorkifyBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkifyBackendApplication.class, args);
    }
} 