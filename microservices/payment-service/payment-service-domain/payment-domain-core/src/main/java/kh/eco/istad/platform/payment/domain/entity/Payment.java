package kh.eco.istad.platform.payment.domain.entity;

import kh.eco.istad.common.domain.entity.AggregateRoot;
import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.valueobject.OrderId;
import kh.eco.istad.platform.payment.domain.valueobject.PaymentId;
import kh.eco.istad.platform.payment.domain.valueobject.PaymentStatus;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

public class Payment extends AggregateRoot<PaymentId> {

    private final OrderId orderId;
    private final CustomerId customerId;
    private final Money price;

    private PaymentStatus paymentStatus;
    private ZonedDateTime createdAt;

    public Payment(OrderId orderId, CustomerId customerId, Money price) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.price = price;
    }

    public void validatePayment(List<String> failureMessages) {
        if (price == null || !price.isGreaterThanZero()) {
            failureMessages.add("Total price must be greater than zero!");
        }
    }

    public void initializePayment() {
        if (orderId == null || customerId == null || price == null) {
            throw new IllegalStateException("Payment requires an order, customer, and amount");
        }
        if (getId() != null) throw new IllegalStateException("Payment is already initialized");
        super.setId(new PaymentId(UUID.randomUUID()));
        createdAt = ZonedDateTime.now(ZoneOffset.UTC);
    }

    public void updateStatus(PaymentStatus paymentStatus) {
        if (paymentStatus == null) throw new IllegalArgumentException("Payment status is required");
        if (this.paymentStatus != null && !(this.paymentStatus == PaymentStatus.COMPLETED
                && paymentStatus == PaymentStatus.CANCELLED)) {
            throw new IllegalStateException("Invalid payment status transition");
        }
        this.paymentStatus = paymentStatus;
    }

    public OrderId getOrderId() {
        return orderId;
    }

    public CustomerId getCustomerId() {
        return customerId;
    }

    public Money getPrice() {
        return price;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }
}
