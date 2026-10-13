package kh.eco.istad.platform.order.domain.port.out;

import kh.eco.istad.common.domain.valueobject.Money;

import java.util.UUID;

public interface PaymentGateway {

    PaymentResult pay(
            UUID customerId,
            UUID orderId,
            Money amount,
            String idempotencyKey
    );

    record PaymentResult(
            UUID paymentId,
            UUID customerId,
            UUID orderId,
            Money amount,
            String status
    ) {
    }
}
