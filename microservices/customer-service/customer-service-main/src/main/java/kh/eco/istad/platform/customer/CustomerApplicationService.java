package kh.eco.istad.platform.customer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
        "kh.eco.istad.platform.customer",
        "kh.eco.istad.common.restapi"
})
public class CustomerApplicationService {

    public static void main(String[] args) {
        SpringApplication.run(CustomerApplicationService.class, args);
    }
}