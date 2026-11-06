package kh.eco.istad.platform.order.client.customer;

import kh.eco.istad.common.domain.valueobject.CustomerId;
import build.buf.gen.customer.v1.CustomerServiceGrpc;
import build.buf.gen.customer.v1.GetCustomerRequest;
import build.buf.gen.customer.v1.GetCustomerResponse;
import kh.eco.istad.platform.order.domain.entity.Customer;
import kh.eco.istad.platform.order.domain.exception.ExternalServiceException;
import kh.eco.istad.platform.order.domain.port.out.CustomerRepository;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Component
public class CustomerServiceGrpcAdapter implements CustomerRepository {

    private final CustomerServiceGrpc.CustomerServiceBlockingStub customerService;
    private final long timeoutMs;

    public CustomerServiceGrpcAdapter(
            CustomerServiceGrpc.CustomerServiceBlockingStub customerService,
            @Value("${customer-service.grpc.timeout-ms:3000}") long timeoutMs) {
        this.customerService = customerService;
        this.timeoutMs = timeoutMs;
    }

    @Override
    public Optional<Customer> findCustomer(CustomerId customerId) {
        GetCustomerRequest request = GetCustomerRequest.newBuilder()
                .setCustomerId(customerId.value().toString())
                .build();

        try {
            GetCustomerResponse response = customerService
                    .withDeadlineAfter(timeoutMs, TimeUnit.MILLISECONDS)
                    .getCustomer(request);

            Customer customer = Customer.builder()
                    .id(customerId)
                    .username(response.getUsername())
                    .givenName(response.getGivenName())
                    .familyName(response.getFamilyName())
                    .active("ACTIVE".equalsIgnoreCase(response.getStatus()))
                    .build();
            return Optional.of(customer);
        } catch (StatusRuntimeException ex) {
            if (ex.getStatus().getCode() == Status.Code.NOT_FOUND) {
                return Optional.empty();
            }
            throw new ExternalServiceException("Customer service is unavailable", ex);
        }
    }
}
