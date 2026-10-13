package kh.eco.istad.platform.payment.persistence.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "credit_transactions", uniqueConstraints = @UniqueConstraint(name = "uk_credit_transaction_operation", columnNames = "operation_id"))
public class CreditTransactionEntity {
    @Id
    private UUID id;
    @Column(name = "customer_id", nullable = false)
    private UUID customerId;
    @Column(name = "payment_id")
    private UUID paymentId;
    @Column(name = "operation_id", nullable = false, unique = true)
    private UUID operationId;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;
    @Column(nullable = false, length = 12)
    private String type;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CreditTransactionEntity() {
    }

    public CreditTransactionEntity(UUID id, UUID customerId, UUID paymentId, UUID operationId, BigDecimal amount, String type) {
        this.id = id;
        this.customerId = customerId;
        this.paymentId = paymentId;
        this.operationId = operationId;
        this.amount = amount;
        this.type = type;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public UUID getPaymentId() {
        return paymentId;
    }

    public UUID getOperationId() {
        return operationId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getType() {
        return type;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
