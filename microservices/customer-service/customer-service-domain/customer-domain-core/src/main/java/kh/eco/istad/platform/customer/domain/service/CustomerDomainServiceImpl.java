package kh.eco.istad.platform.customer.domain.service;

import kh.eco.istad.platform.customer.domain.entity.Customer;
import kh.eco.istad.platform.customer.domain.event.CustomerDeactivatedEvent;
import kh.eco.istad.platform.customer.domain.event.CustomerInitiatedEvent;
import kh.eco.istad.platform.customer.domain.event.CustomerUpdatedEvent;
import kh.eco.istad.platform.customer.domain.valueobject.Email;
import kh.eco.istad.platform.customer.domain.valueobject.PhoneNumber;

import java.time.ZoneId;
import java.time.ZonedDateTime;

public class CustomerDomainServiceImpl implements CustomerDomainService {

    private static final ZoneId UTC = ZoneId.of("UTC");

    @Override
    public CustomerInitiatedEvent initiateCustomer(Customer customer) {
        customer.initiateCustomer();
        return new CustomerInitiatedEvent(customer, ZonedDateTime.now(UTC));
    }

    @Override
    public CustomerUpdatedEvent updateCustomer(
            Customer customer,
            String familyName,
            String givenName,
            Email email,
            PhoneNumber phoneNumber
    ) {
        customer.updateCustomer(familyName, givenName, email, phoneNumber);
        return new CustomerUpdatedEvent(customer, ZonedDateTime.now(UTC));
    }

    @Override
    public CustomerDeactivatedEvent deactivateCustomer(Customer customer) {
        customer.deactivateCustomer();
        return new CustomerDeactivatedEvent(customer, ZonedDateTime.now(UTC));
    }
}