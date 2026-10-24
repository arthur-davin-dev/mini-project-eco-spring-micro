//package kh.eco.istad.platform.order.client.customer;
//
//import kh.eco.istad.common.domain.valueobject.CustomerId;
//import kh.eco.istad.platform.order.domain.entity.Customer;
//import kh.eco.istad.platform.order.domain.exception.ExternalServiceException;
//import kh.eco.istad.platform.order.domain.port.out.CustomerRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Qualifier;
//import org.springframework.stereotype.Component;
//import org.springframework.web.client.HttpClientErrorException;
//import org.springframework.web.client.RestClient;
//import org.springframework.web.client.RestClientException;
//
//import java.util.Optional;
//
//@Component
//public class CustomerServiceRestAdapter implements CustomerRepository {
//
//    private static final Logger log = LoggerFactory.getLogger(CustomerServiceRestAdapter.class);
//
//    private final RestClient restClient;
//
//    public CustomerServiceRestAdapter(@Qualifier("customerRestClient") RestClient restClient) {
//        this.restClient = restClient;
//    }
//
//    @Override
//    public Optional<Customer> findCustomer(CustomerId customerId) {
//        try {
//            CustomerPayload payload = restClient.get()
//                    .uri("/api/customers/{id}", customerId.value())
//                    .retrieve()
//                    .body(CustomerPayload.class);
//
//            if (payload == null) {
//                return Optional.empty();
//            }
//            return Optional.of(new Customer(customerId, "ACTIVE".equals(payload.status())));
//        } catch (HttpClientErrorException.NotFound ex) {
//            return Optional.empty();
//        } catch (RestClientException | IllegalStateException ex) {
//            // IllegalStateException: Spring Cloud LoadBalancer found no instance of the service in Eureka
//            log.error("Call to customer-service failed", ex);
//            throw new ExternalServiceException("Customer service is unavailable", ex);
//        }
//    }
//}


package kh.eco.istad.platform.order.client.customer;

import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.platform.order.domain.entity.Customer;
import kh.eco.istad.platform.order.domain.exception.ExternalServiceException;
import kh.eco.istad.platform.order.domain.port.out.CustomerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Optional;

@Component
public class CustomerServiceRestAdapter implements CustomerRepository {

    private static final Logger log =
            LoggerFactory.getLogger(CustomerServiceRestAdapter.class);

    private final RestClient restClient;

    public CustomerServiceRestAdapter(
            @Qualifier("customerRestClient") RestClient restClient
    ) {
        this.restClient = restClient;
    }

    @Override
    public Optional<Customer> findCustomer(CustomerId customerId) {
        try {
            CustomerPayload payload = restClient.get()
                    .uri("/api/customers/{id}", customerId.value())
                    .retrieve()
                    .body(CustomerPayload.class);

            if (payload == null) {
                return Optional.empty();
            }

            Customer customer = Customer.builder()
                    .id(customerId)
                    .username(payload.username())
                    .givenName(payload.givenName())
                    .familyName(payload.familyName())
                    .active("ACTIVE".equalsIgnoreCase(payload.status()))
                    .build();

            return Optional.of(customer);

        } catch (HttpClientErrorException.NotFound ex) {
            return Optional.empty();

        } catch (RestClientException | IllegalStateException ex) {
            log.error(
                    "Failed to retrieve customer with ID {}",
                    customerId.value(),
                    ex
            );

            throw new ExternalServiceException(
                    "Customer service is unavailable",
                    ex
            );
        }
    }
}
