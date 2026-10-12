package kh.eco.istad.platform.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
        "kh.eco.istad.platform.order",
        "kh.eco.istad.common.restapi"
})
public class OrderApplicationService {

    public static void main(String[] args) {
        SpringApplication.run(OrderApplicationService.class, args);
    }
}