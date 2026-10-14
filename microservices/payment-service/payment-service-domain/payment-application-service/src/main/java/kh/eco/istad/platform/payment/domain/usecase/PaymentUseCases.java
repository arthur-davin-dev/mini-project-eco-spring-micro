package kh.eco.istad.platform.payment.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.payment.domain.dto.CreditRecord;
import kh.eco.istad.platform.payment.domain.dto.PaymentRecord;
import kh.eco.istad.platform.payment.domain.port.out.PaymentStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PaymentUseCases {
    private final PaymentStore store;

    public PaymentUseCases(PaymentStore store) {
        this.store = store;
    }

    public PaymentRecord initiate(
            UUID customerId,
            UUID orderId,
            Money amount,
            String key
    ) {
        requirePositive(amount);
        if (customerId == null || orderId == null)
            throw new IllegalArgumentException("Customer and order are required");
        if (key != null && (key.isBlank() || key.length() > 128))
            throw new IllegalArgumentException("Idempotency key must contain 1 to 128 characters");
        return store.pay(customerId, orderId, amount, key);
    }

    public void createAccount(UUID customerId, Money initialCredit) {
        if (customerId == null) throw new IllegalArgumentException("Customer is required");
        if (initialCredit == null || initialCredit.amount().signum() < 0)
            throw new IllegalArgumentException("Initial credit cannot be negative");
        store.createAccount(customerId, initialCredit);
    }

    public Money balance(UUID customerId) {
        requireCustomer(customerId);
        return store.balance(customerId);
    }

    public Money topUp(UUID customerId, Money amount, UUID operationId) {
        requireCustomer(customerId);
        if (operationId == null) throw new IllegalArgumentException("Idempotency key is required");
        requirePositive(amount);
        return store.addCredit(customerId, amount, operationId);
    }

    public PaymentRecord payment(UUID id) {
        if (id == null) throw new IllegalArgumentException("Payment id is required");
        return store.find(id).orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
    }

    public PaymentRecord byOrder(UUID id) {
        if (id == null) throw new IllegalArgumentException("Order id is required");
        return store.findByOrder(id).orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
    }

    public PaymentRecord cancel(UUID id) {
        if (id == null) throw new IllegalArgumentException("Payment id is required");
        return store.cancel(id);
    }

    public List<CreditRecord> history(UUID id) {
        requireCustomer(id);
        return store.history(id);
    }

    private void requireCustomer(UUID customerId) {
        if (customerId == null) throw new IllegalArgumentException("Customer is required");
    }

    private void requirePositive(Money amount) {
        if (amount == null || !amount.isGreaterThanZero())
            throw new IllegalArgumentException("Amount must be greater than zero");
    }
}
