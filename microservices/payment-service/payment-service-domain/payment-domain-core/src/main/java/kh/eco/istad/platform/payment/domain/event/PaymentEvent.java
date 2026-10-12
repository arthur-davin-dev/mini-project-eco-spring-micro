package kh.eco.istad.platform.payment.domain.event;

import kh.eco.istad.common.domain.event.DomainEvent;
import kh.eco.istad.platform.payment.domain.entity.Payment;

import java.time.ZonedDateTime;
import java.util.List;

public sealed interface PaymentEvent extends DomainEvent<Payment>
        permits PaymentCompletedEvent, PaymentCancelledEvent, PaymentFailedEvent {

    Payment payment();

    ZonedDateTime createdAt();

    List<String> failureMessages();
}