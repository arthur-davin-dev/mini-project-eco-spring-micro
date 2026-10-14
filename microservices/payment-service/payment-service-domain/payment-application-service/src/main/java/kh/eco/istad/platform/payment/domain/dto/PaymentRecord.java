package kh.eco.istad.platform.payment.domain.dto;

import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.valueobject.OrderId;
import kh.eco.istad.platform.payment.domain.valueobject.PaymentId;
import kh.eco.istad.platform.payment.domain.valueobject.PaymentStatus;

import java.time.Instant;

public record PaymentRecord(
        PaymentId id,
        OrderId orderId,
        CustomerId customerId,
        Money amount,
        PaymentStatus status,
        Instant createdAt) {
}
