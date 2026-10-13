package kh.eco.istad.platform.payment.persistence.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "credit_accounts", uniqueConstraints = @UniqueConstraint(name = "uk_credit_account_customer", columnNames = "customer_id"))
public class CreditAccountEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "customer_id", nullable = false, unique = true)
    private UUID customerId;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance;
    @Version
    private long version;

    protected CreditAccountEntity() {
    }

    public CreditAccountEntity(UUID customerId, BigDecimal balance) {
        this.customerId = customerId;
        this.balance = balance;
    }

    public UUID getId() {
        return id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}
