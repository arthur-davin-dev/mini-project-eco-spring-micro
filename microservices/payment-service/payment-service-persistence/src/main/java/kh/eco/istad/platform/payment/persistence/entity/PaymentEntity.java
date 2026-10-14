package kh.eco.istad.platform.payment.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Entity
@Table(name = "payments", uniqueConstraints = {@UniqueConstraint(name = "uk_payment_order", columnNames = "order_id"), @UniqueConstraint(name = "uk_payment_idempotency", columnNames = "idempotency_key")})
public class PaymentEntity {
    @Id
    private UUID id;
    @Column(name = "order_id", nullable = false, unique = true)
    private UUID orderId;
    @Column(name = "customer_id", nullable = false)
    private UUID customerId;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;
    @Setter
    @Column(nullable = false, length = 20)
    private String status;
    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected PaymentEntity() {
    }

    public PaymentEntity(UUID id, UUID orderId, UUID customerId, BigDecimal amount, String status, String key) {
        this.id = id;
        this.orderId = orderId;
        this.customerId = customerId;
        this.amount = amount;
        this.status = status;
        this.idempotencyKey = key;
        this.createdAt = Instant.now();
    }

}
