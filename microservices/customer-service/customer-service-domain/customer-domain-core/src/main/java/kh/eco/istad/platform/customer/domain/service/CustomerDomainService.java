package kh.eco.istad.platform.customer.domain.service;

import kh.eco.istad.platform.customer.domain.entity.Customer;
import kh.eco.istad.platform.customer.domain.event.CustomerDeactivatedEvent;
import kh.eco.istad.platform.customer.domain.event.CustomerInitiatedEvent;
import kh.eco.istad.platform.customer.domain.event.CustomerUpdatedEvent;
import kh.eco.istad.platform.customer.domain.valueobject.Email;
import kh.eco.istad.platform.customer.domain.valueobject.PhoneNumber;

public interface CustomerDomainService {

    CustomerInitiatedEvent initiateCustomer(Customer customer);

    CustomerUpdatedEvent updateCustomer(Customer customer, String familyName, String givenName,
                                        Email email, PhoneNumber phoneNumber);

    CustomerDeactivatedEvent deactivateCustomer(Customer customer);
}