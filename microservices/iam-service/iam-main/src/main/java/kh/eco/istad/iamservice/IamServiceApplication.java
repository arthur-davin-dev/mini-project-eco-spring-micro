package kh.eco.istad.iamservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"kh.eco.istad.iamservice", "kh.eco.istad.iam"})
@EntityScan(basePackages = "kh.eco.istad.iam.persistence.jpa.entity")
@EnableJpaRepositories(basePackages = "kh.eco.istad.iam.persistence.jpa.repository")
public class IamServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IamServiceApplication.class, args);
    }

}
