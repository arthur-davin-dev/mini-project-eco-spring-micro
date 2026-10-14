package kh.eco.istad.platform.payment.persistence.adapter;

import kh.eco.istad.common.domain.exception.ResourceNotFoundException;
import kh.eco.istad.common.domain.exception.ConflictException;
import kh.eco.istad.common.domain.valueobject.*;
import kh.eco.istad.platform.payment.domain.dto.CreditRecord;
import kh.eco.istad.platform.payment.domain.dto.PaymentRecord;
import kh.eco.istad.platform.payment.domain.port.out.PaymentStore;
import kh.eco.istad.platform.payment.domain.entity.CreditEntry;
import kh.eco.istad.platform.payment.domain.entity.CreditHistory;
import kh.eco.istad.platform.payment.domain.entity.Payment;
import kh.eco.istad.platform.payment.domain.event.PaymentCompletedEvent;
import kh.eco.istad.platform.payment.domain.event.PaymentCancelledEvent;
import kh.eco.istad.platform.payment.domain.service.PaymentDomainService;
import kh.eco.istad.platform.payment.domain.valueobject.*;
import kh.eco.istad.platform.payment.persistence.entity.*;
import kh.eco.istad.platform.payment.persistence.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.time.ZoneOffset;

import static java.util.stream.Collectors.toCollection;

@Repository
public class PaymentStoreAdapter implements PaymentStore {
    private final CreditAccountJpaRepository accounts;
    private final PaymentJpaRepository payments;
    private final CreditTransactionJpaRepository transactions;
    private final PaymentDomainService paymentDomainService;

    public PaymentStoreAdapter(CreditAccountJpaRepository accounts, PaymentJpaRepository payments, CreditTransactionJpaRepository transactions, PaymentDomainService paymentDomainService) {
        this.accounts = accounts;
        this.payments = payments;
        this.transactions = transactions;
        this.paymentDomainService = paymentDomainService;
    }

    @Override
    @Transactional
    public void createAccount(UUID customerId, Money initial) {
        if (accounts.findByCustomerId(customerId).isPresent())
            throw new ConflictException("Credit account already exists");
        accounts.save(new CreditAccountEntity(customerId, initial.amount()));
        if (initial.isGreaterThanZero())
            transactions.save(new CreditTransactionEntity(UUID.randomUUID(), customerId, null, UUID.randomUUID(), initial.amount(), "CREDIT"));
    }

    @Override
    @Transactional(readOnly = true)
    public Money balance(UUID customerId) {
        return new Money(account(customerId).getBalance());
    }

    @Override
    @Transactional
    public Money addCredit(UUID customerId, Money amount, UUID operationId) {
        CreditTransactionEntity seen = transactions.findByOperationId(operationId).orElse(null);
        if (seen != null) {
            if (!seen.getCustomerId().equals(customerId) || !seen.getAmount().equals(amount.amount()))
                throw new ConflictException("Operation key already used with different details");
            return balance(customerId);
        }
        CreditAccountEntity account = lock(customerId);
        CreditEntry credit = new CreditEntry(
                new CreditEntryId(account.getId()), new CustomerId(customerId), new Money(account.getBalance()));
        credit.addCreditAmount(amount);
        account.setBalance(credit.getTotalCreditAmount().amount());
        transactions.save(new CreditTransactionEntity(UUID.randomUUID(), customerId, null, operationId, amount.amount(), "CREDIT"));
        return new Money(account.getBalance());
    }

    @Override
    @Transactional
    public PaymentRecord pay(UUID customerId, UUID orderId, Money amount, String key) {
        if (key != null) {
            PaymentEntity old = payments.findByIdempotencyKey(key).orElse(null);
            if (old != null) {
                if (!old.getOrderId().equals(orderId) || !old.getCustomerId().equals(customerId) || !old.getAmount().equals(amount.amount()))
                    throw new ConflictException("Idempotency key reused with different payment details");
                return map(old);
            }
        }
        PaymentEntity existing = payments.findByOrderId(orderId).orElse(null);
        if (existing != null) {
            if (!existing.getCustomerId().equals(customerId))
                throw new ConflictException("Order is already associated with another customer");
            if (existing.getAmount().compareTo(amount.amount()) != 0)
                throw new ConflictException("Order already has a payment with a different amount");
            return map(existing);
        }
        CreditAccountEntity account = lock(customerId);
        List<CreditHistory> history = loadCreditHistory(customerId);
        CreditEntry credit = new CreditEntry(
                new CreditEntryId(account.getId()),
                new CustomerId(customerId),
                new Money(account.getBalance())
        );
        Payment domainPayment = new Payment(
                new OrderId(orderId),
                new CustomerId(customerId), amount
        );
        List<String> failures = new ArrayList<>();
        if (!(paymentDomainService.validateAndInitiatePayment(domainPayment, credit, history, failures) instanceof PaymentCompletedEvent))
            throw new kh.eco.istad.platform.payment.domain.exception.PaymentDomainException(String.join("; ", failures));
        UUID paymentId = domainPayment.getId().value();
        account.setBalance(credit.getTotalCreditAmount().amount());
        PaymentEntity payment = new PaymentEntity(paymentId, orderId, customerId, amount.amount(), PaymentStatus.COMPLETED.name(), key);
        payments.save(payment);
        transactions.save(new CreditTransactionEntity(UUID.randomUUID(), customerId, paymentId, paymentId, amount.amount(), "DEBIT"));
        return map(payment);
    }

    @Override
    @Transactional
    public PaymentRecord cancel(UUID paymentId) {
        PaymentEntity payment = payments.lockById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        if (PaymentStatus.CANCELLED.name().equals(payment.getStatus()))
            return map(payment);
        CreditAccountEntity account = lock(payment.getCustomerId());
        List<CreditHistory> history = loadCreditHistory(payment.getCustomerId());
        CreditEntry credit = new CreditEntry(
                new CreditEntryId(account.getId()), new CustomerId(payment.getCustomerId()), new Money(account.getBalance()));
        Payment domainPayment = Payment.restore(
                new PaymentId(payment.getId()), new OrderId(payment.getOrderId()),
                new CustomerId(payment.getCustomerId()), new Money(payment.getAmount()),
                PaymentStatus.valueOf(payment.getStatus()), payment.getCreatedAt().atZone(ZoneOffset.UTC));
        List<String> failures = new ArrayList<>();
        if (!(paymentDomainService.validateAndCancelPayment(domainPayment, credit, history, failures)
                instanceof PaymentCancelledEvent)) {
            throw new kh.eco.istad.platform.payment.domain.exception.PaymentDomainException(String.join("; ", failures));
        }
        account.setBalance(credit.getTotalCreditAmount().amount());
        payment.setStatus(domainPayment.getPaymentStatus().name());
        transactions.save(
                new CreditTransactionEntity(
                        UUID.randomUUID(),
                        payment.getCustomerId(),
                        paymentId, UUID.randomUUID(),
                        payment.getAmount(),
                        "CREDIT"
                )
        );
        return map(payment);
    }

    private List<CreditHistory> loadCreditHistory(UUID customerId) {
        return transactions.findAllByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(t -> new CreditHistory(
                        new CreditHistoryId(t.getId()), new CustomerId(customerId),
                        new Money(t.getAmount()), TransactionType.valueOf(t.getType())))
                .collect(toCollection(ArrayList::new));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaymentRecord> find(UUID id) {
        return payments.findById(id).map(this::map);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaymentRecord> findByOrder(UUID id) {
        return payments.findByOrderId(id).map(this::map);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CreditRecord> history(UUID customer) {
        return transactions.findAllByCustomerIdOrderByCreatedAtDesc(customer).stream().map(t -> new CreditRecord(t.getId(), new Money(t.getAmount()), t.getType(), t.getCreatedAt(), t.getPaymentId())).toList();
    }

    private CreditAccountEntity account(UUID id) {
        return accounts.findByCustomerId(id).orElseThrow(() -> new ResourceNotFoundException("Credit account not found"));
    }

    private CreditAccountEntity lock(UUID id) {
        return accounts.lockByCustomer(id).orElseThrow(() -> new ResourceNotFoundException("Credit account not found"));
    }

    private PaymentRecord map(PaymentEntity p) {
        return new PaymentRecord(new PaymentId(p.getId()), new OrderId(p.getOrderId()), new CustomerId(p.getCustomerId()), new Money(p.getAmount()), PaymentStatus.valueOf(p.getStatus()), p.getCreatedAt());
    }
}
