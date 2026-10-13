package kh.eco.istad.platform.payment.domain.port.out;

import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.valueobject.OrderId;
import kh.eco.istad.platform.payment.domain.valueobject.PaymentId;
import kh.eco.istad.platform.payment.domain.valueobject.PaymentStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentStore {
    void createAccount(UUID customerId, Money openingCredit);

    Money balance(UUID customerId);

    Money addCredit(UUID customerId, Money amount, UUID operationId);

    PaymentRecord pay(UUID customerId, UUID orderId, Money amount, String idempotencyKey);

    PaymentRecord cancel(UUID paymentId);

    Optional<PaymentRecord> find(UUID paymentId);

    Optional<PaymentRecord> findByOrder(UUID orderId);

    List<CreditRecord> history(UUID customerId);

    record PaymentRecord(PaymentId id, OrderId orderId, CustomerId customerId, Money amount,
                         PaymentStatus status, Instant createdAt) {
    }

    record CreditRecord(UUID id, Money amount, String type, Instant createdAt, UUID paymentId) {
    }
}
