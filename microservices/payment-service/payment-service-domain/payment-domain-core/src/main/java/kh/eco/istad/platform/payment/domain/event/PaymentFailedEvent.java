package kh.eco.istad.platform.payment.domain.event;

import kh.eco.istad.platform.payment.domain.entity.Payment;

import java.time.ZonedDateTime;
import java.util.List;

public record PaymentFailedEvent(
        Payment payment,
        ZonedDateTime createdAt,
        List<String> failureMessages
)
        implements PaymentEvent {
}