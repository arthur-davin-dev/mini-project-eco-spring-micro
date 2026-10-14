package kh.eco.istad.platform.payment.restapi.dto;

import kh.eco.istad.platform.payment.domain.dto.PaymentRecord;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentView(
        UUID paymentId,
        UUID orderId,
        UUID customerId,
        BigDecimal amount,
        String status,
        Instant createdAt
) {
    public static PaymentView from(PaymentRecord record) {
        return new PaymentView(
                record.id().value(),
                record.orderId().value(),
                record.customerId().value(),
                record.amount().amount(),
                record.status().name(),
                record.createdAt()
        );
    }
}
