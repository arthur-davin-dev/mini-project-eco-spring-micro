package kh.eco.istad.platform.payment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
        "kh.eco.istad.platform.payment",
        "kh.eco.istad.common.restapi"
})
public class PaymentApplicationService {
    public static void main(String[] args) {
        SpringApplication.run(PaymentApplicationService.class, args);
    }
}
