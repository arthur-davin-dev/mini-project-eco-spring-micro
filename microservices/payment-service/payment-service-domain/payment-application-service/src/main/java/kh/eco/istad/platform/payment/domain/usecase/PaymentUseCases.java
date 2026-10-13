package kh.eco.istad.platform.payment.domain.usecase;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.valueobject.Money;
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

    public PaymentStore.PaymentRecord initiate(UUID customerId, UUID orderId, Money amount, String key) {
        requirePositive(amount);
        if (customerId == null || orderId == null)
            throw new IllegalArgumentException("Customer and order are required");
        return store.pay(customerId, orderId, amount, key);
    }

    public void createAccount(UUID customerId, Money initialCredit) {
        if (customerId == null) throw new IllegalArgumentException("Customer is required");
        if (initialCredit == null || initialCredit.amount().signum() < 0)
            throw new IllegalArgumentException("Initial credit cannot be negative");
        store.createAccount(customerId, initialCredit);
    }

    public Money balance(UUID customerId) {
        return store.balance(customerId);
    }

    public Money topUp(UUID customerId, Money amount, UUID operationId) {
        requirePositive(amount);
        return store.addCredit(customerId, amount, operationId);
    }

    public PaymentStore.PaymentRecord payment(UUID id) {
        return store.find(id).orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
    }

    public PaymentStore.PaymentRecord byOrder(UUID id) {
        return store.findByOrder(id).orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
    }

    public PaymentStore.PaymentRecord cancel(UUID id) {
        return store.cancel(id);
    }

    public List<PaymentStore.CreditRecord> history(UUID id) {
        return store.history(id);
    }

    private void requirePositive(Money amount) {
        if (amount == null || !amount.isGreaterThanZero())
            throw new IllegalArgumentException("Amount must be greater than zero");
    }
}
