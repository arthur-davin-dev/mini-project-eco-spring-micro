package kh.eco.istad.platform.customer.restapi.mapper;

import kh.eco.istad.platform.customer.domain.dto.CustomerResult;
import kh.eco.istad.platform.customer.domain.dto.InitiateCustomerCommand;
import kh.eco.istad.platform.customer.domain.dto.UpdateCustomerCommand;
import kh.eco.istad.platform.customer.restapi.dto.CreateCustomerRequest;
import kh.eco.istad.platform.customer.restapi.dto.CustomerResponse;
import kh.eco.istad.platform.customer.restapi.dto.UpdateCustomerRequest;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CustomerWebMapper {

    public InitiateCustomerCommand toCommand(CreateCustomerRequest request) {
        return new InitiateCustomerCommand(
                request.username(), request.familyName(), request.givenName(),
                request.email(), request.phoneNumber());
    }

    public UpdateCustomerCommand toCommand(UUID customerId, UpdateCustomerRequest request) {
        return new UpdateCustomerCommand(
                customerId, request.familyName(), request.givenName(),
                request.email(), request.phoneNumber());
    }

    public CustomerResponse toResponse(CustomerResult result) {
        return new CustomerResponse(
                result.customerId(), result.username(), result.familyName(), result.givenName(),
                result.email(), result.phoneNumber(), result.status());
    }
}