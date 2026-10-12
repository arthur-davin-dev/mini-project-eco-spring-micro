package kh.eco.istad.platform.order.domain.event;

import kh.eco.istad.common.domain.event.DomainEvent;
import kh.eco.istad.platform.order.domain.entity.Order;

import java.time.ZonedDateTime;

public record OrderCancelledEvent(
        Order order,
        ZonedDateTime createdAt
) implements DomainEvent<Order> {
}