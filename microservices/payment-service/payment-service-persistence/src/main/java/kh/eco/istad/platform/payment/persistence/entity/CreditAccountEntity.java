package kh.eco.istad.platform.payment.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;
@Getter
@Setter
@AllArgsConstructor
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

}
