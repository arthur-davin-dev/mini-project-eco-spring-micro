package kh.eco.istad.platform.customer.domain.service;

import kh.eco.istad.platform.customer.domain.entity.Customer;
import kh.eco.istad.common.domain.exception.ConflictException;
import kh.eco.istad.platform.customer.domain.event.CustomerInitiatedEvent;
import kh.eco.istad.platform.customer.domain.exception.CustomerDomainException;
import kh.eco.istad.platform.customer.domain.valueobject.CustomerStatus;
import kh.eco.istad.platform.customer.domain.valueobject.Email;
import kh.eco.istad.platform.customer.domain.valueobject.PhoneNumber;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class CustomerDomainServiceTest {

    private final CustomerDomainService service = new CustomerDomainServiceImpl();

    @Test
    void initiatesActiveCustomerAndRaisesEvent() {
        Customer customer = validCustomer();

        CustomerInitiatedEvent event = service.initiateCustomer(customer);

        assertNotNull(customer.getId());
        assertEquals(CustomerStatus.ACTIVE, customer.getStatus());
        assertNotNull(event.createdAt());
    }

    @Test
    void deactivatesOnlyOnce() {
        Customer customer = validCustomer();
        service.initiateCustomer(customer);

        service.deactivateCustomer(customer);

        assertEquals(CustomerStatus.INACTIVE, customer.getStatus());
        assertThrows(ConflictException.class, () -> service.deactivateCustomer(customer));
    }

    private Customer validCustomer() {
        return Customer.builder()
                .username("alex")
                .familyName("Doe")
                .givenName("Alex")
                .email(new Email("alex@example.com"))
                .phoneNumber(new PhoneNumber("+85512345678"))
                .build();
    }
}
