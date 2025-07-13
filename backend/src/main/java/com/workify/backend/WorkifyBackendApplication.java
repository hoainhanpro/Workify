package com.workify.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.web.client.RestTemplate;

import com.workify.backend.config.CorsProperties;
import com.workify.backend.config.GoogleOAuthProperties;
import com.workify.backend.config.JwtProperties;

@SpringBootApplication
@EnableMongoAuditing
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class, GoogleOAuthProperties.class})
public class WorkifyBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkifyBackendApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
} 