package kh.eco.istad.platform.order.domain.out.client;

import reactor.core.publisher.Flux;

public interface CustomerServiceClient {

    Flux<CustomerInfo> getCustomers();

    record CustomerInfo(
            String customerId,
            String givenName,
            String username,
            String familyName,
            String email,
            String phoneNumber,
            String status
    ) {}
}
