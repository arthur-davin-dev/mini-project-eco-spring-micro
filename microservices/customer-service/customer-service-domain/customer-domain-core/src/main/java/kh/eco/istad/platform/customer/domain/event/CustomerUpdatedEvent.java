package kh.eco.istad.platform.customer.domain.event;

import kh.eco.istad.common.domain.event.DomainEvent;
import kh.eco.istad.platform.customer.domain.entity.Customer;

import java.time.ZonedDateTime;

public record CustomerUpdatedEvent(
        Customer customer,
        ZonedDateTime createdAt
)
        implements DomainEvent<Customer> {
}