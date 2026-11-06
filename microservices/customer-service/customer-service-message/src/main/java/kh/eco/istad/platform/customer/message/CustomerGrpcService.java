package kh.eco.istad.platform.customer.message;

import kh.eco.istad.platform.customer.domain.dto.CustomerResult;
import kh.eco.istad.platform.customer.domain.usecase.GetCustomerUseCase;
import build.buf.gen.customer.v1.CustomerServiceGrpc;
import build.buf.gen.customer.v1.GetCustomerRequest;
import build.buf.gen.customer.v1.GetCustomerResponse;
import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CustomerGrpcService extends CustomerServiceGrpc.CustomerServiceImplBase {

    private final GetCustomerUseCase getCustomerUseCase;

    public CustomerGrpcService(GetCustomerUseCase getCustomerUseCase) {
        this.getCustomerUseCase = getCustomerUseCase;
    }

    @Override
    public void getCustomer(GetCustomerRequest request, StreamObserver<GetCustomerResponse> observer) {
        final UUID customerId;
        try {
            customerId = UUID.fromString(request.getCustomerId());
        } catch (IllegalArgumentException ex) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("customer_id must be a UUID")
                    .asRuntimeException());
            return;
        }

        try {
            CustomerResult customer = getCustomerUseCase.execute(customerId);
            GetCustomerResponse response = GetCustomerResponse.newBuilder()
                    .setCustomerId(customer.customerId().toString())
                    .setUsername(customer.username())
                    .setFamilyName(customer.familyName())
                    .setGivenName(customer.givenName())
                    .setEmail(customer.email())
                    .setPhoneNumber(customer.phoneNumber())
                    .setStatus(customer.status())
                    .build();
            observer.onNext(response);
            observer.onCompleted();
        } catch (ResourceNotFoundException ex) {
            observer.onError(Status.NOT_FOUND
                    .withDescription("Customer not found")
                    .asRuntimeException());
        }
    }
}
