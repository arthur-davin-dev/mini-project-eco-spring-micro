package kh.eco.istad.platform.payment.domain.dto;

import kh.eco.istad.common.domain.valueobject.Money;

import java.time.Instant;
import java.util.UUID;

public record CreditRecord(
        UUID id,
        Money amount,
        String type,
        Instant createdAt,
        UUID paymentId
) {
}
