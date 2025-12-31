package com.creatorx.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.creatorx")
@EnableJpaRepositories(basePackages = "com.creatorx.repository")
@EntityScan(basePackages = "com.creatorx.repository.entity")
@EnableJpaAuditing
@EnableCaching
@EnableScheduling
public class CreatorXApplication {
    public static void main(String[] args) {
        SpringApplication.run(CreatorXApplication.class, args);
    }
}



