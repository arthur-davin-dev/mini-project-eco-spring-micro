package kh.eco.istad.platform.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.grpc.client.ImportGrpcClients;
import build.buf.gen.customer.v1.CustomerServiceGrpc;

@SpringBootApplication(scanBasePackages = {
        "kh.eco.istad.platform.order",
        "kh.eco.istad.common.restapi"
})
@ImportGrpcClients(target = "customer-service", types = CustomerServiceGrpc.CustomerServiceBlockingStub.class)
public class OrderApplicationService {

    public static void main(String[] args) {
        SpringApplication.run(OrderApplicationService.class, args);
    }
}
