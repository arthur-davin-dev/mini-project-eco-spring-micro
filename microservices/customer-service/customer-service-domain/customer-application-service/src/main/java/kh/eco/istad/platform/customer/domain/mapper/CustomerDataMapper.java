package kh.eco.istad.platform.customer.domain.mapper;

import kh.eco.istad.platform.customer.domain.dto.CustomerResult;
import kh.eco.istad.platform.customer.domain.dto.InitiateCustomerCommand;
import kh.eco.istad.platform.customer.domain.entity.Customer;
import kh.eco.istad.platform.customer.domain.valueobject.Email;
import kh.eco.istad.platform.customer.domain.valueobject.PhoneNumber;
import org.springframework.stereotype.Component;

@Component
public class CustomerDataMapper {

    public Customer toCustomer(InitiateCustomerCommand command) {
        return Customer.builder()
                .username(trim(command.username()))
                .familyName(trim(command.familyName()))
                .givenName(trim(command.givenName()))
                .email(new Email(command.email()))
                .phoneNumber(new PhoneNumber(command.phoneNumber()))
                .build();
    }

    public CustomerResult toResult(Customer customer) {
        return new CustomerResult(
                customer.getId().value(),
                customer.getUsername(),
                customer.getFamilyName(),
                customer.getGivenName(),
                customer.getEmail().value(),
                customer.getPhoneNumber().value(),
                customer.getStatus().name());
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}