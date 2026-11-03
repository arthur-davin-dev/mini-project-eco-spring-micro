package kh.eco.istad.platform.order.client.adapter;

import kh.eco.istad.platform.order.domain.out.client.CustomerServiceClient;
import kh.eco.istad.platform.order.domain.out.client.CustomerServiceClient.CustomerInfo;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Component
public class CustomerServiceClientAdapter implements CustomerServiceClient {

    private final WebClient webClient;

    public CustomerServiceClientAdapter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("http://customer-service")
                .build();
    }

    @Override
    public Flux<CustomerInfo> getCustomers() {
        return webClient
                .get()
                .uri("/api/customers")
                .retrieve()
                .bodyToFlux(CustomerInfo.class);
    }
}
