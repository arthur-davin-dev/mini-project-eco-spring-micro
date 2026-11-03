package kh.eco.istad.platform.order.client.httpclient;

import kh.eco.istad.platform.order.domain.dto.QueryCustomerResult;
import org.springframework.security.oauth2.client.annotation.ClientRegistrationId;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@HttpExchange("/api/customers")
@ClientRegistrationId(registrationId = "customer-service")
public interface CustomerHttpClient {
    @GetExchange
    Flux<QueryCustomerResult> queryCustomer();
    @GetExchange("/{id}")
    Mono<QueryCustomerResult> findCustomerById(@PathVariable("id") String id);
}
