package kh.eco.istad.platform.payment.persistence.adapter;

import kh.eco.istad.platform.payment.domain.exception.PaymentDomainException;
import kh.eco.istad.platform.payment.domain.service.PaymentDomainServiceImpl;
import kh.eco.istad.platform.payment.domain.valueobject.PaymentStatus;
import kh.eco.istad.platform.payment.persistence.entity.CreditAccountEntity;
import kh.eco.istad.platform.payment.persistence.entity.CreditTransactionEntity;
import kh.eco.istad.platform.payment.persistence.entity.PaymentEntity;
import kh.eco.istad.platform.payment.persistence.repository.CreditAccountJpaRepository;
import kh.eco.istad.platform.payment.persistence.repository.CreditTransactionJpaRepository;
import kh.eco.istad.platform.payment.persistence.repository.PaymentJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentStoreAdapterTest {

    @Mock private CreditAccountJpaRepository accounts;
    @Mock private PaymentJpaRepository payments;
    @Mock private CreditTransactionJpaRepository transactions;

    private PaymentStoreAdapter adapter;
    private UUID customerId;
    private UUID paymentId;
    private CreditAccountEntity account;
    private PaymentEntity payment;

    @BeforeEach
    void setUp() {
        adapter = new PaymentStoreAdapter(accounts, payments, transactions, new PaymentDomainServiceImpl());
        customerId = UUID.randomUUID();
        paymentId = UUID.randomUUID();
        account = new CreditAccountEntity(customerId, new BigDecimal("70.00"));
        account.setId(UUID.randomUUID());
        payment = new PaymentEntity(paymentId, UUID.randomUUID(), customerId, new BigDecimal("30.00"),
                PaymentStatus.COMPLETED.name(), "payment-key");
        when(payments.lockById(paymentId)).thenReturn(Optional.of(payment));
    }

    @Test
    void cancellationUsesDomainRulesAndPersistsRefundAndHistory() {
        when(accounts.lockByCustomer(customerId)).thenReturn(Optional.of(account));
        when(transactions.findAllByCustomerIdOrderByCreatedAtDesc(customerId)).thenReturn(List.of(
                transaction("30.00", "DEBIT"), transaction("100.00", "CREDIT")));

        var result = adapter.cancel(paymentId);

        assertEquals(PaymentStatus.CANCELLED, result.status());
        assertEquals(new BigDecimal("100.00"), account.getBalance());
        assertEquals(PaymentStatus.CANCELLED.name(), payment.getStatus());
        ArgumentCaptor<CreditTransactionEntity> transaction = ArgumentCaptor.forClass(CreditTransactionEntity.class);
        verify(transactions).save(transaction.capture());
        assertEquals("CREDIT", transaction.getValue().getType());
        assertEquals(new BigDecimal("30.00"), transaction.getValue().getAmount());
    }

    @Test
    void inconsistentCreditHistoryRejectsCancellationWithoutChangingState() {
        when(accounts.lockByCustomer(customerId)).thenReturn(Optional.of(account));
        when(transactions.findAllByCustomerIdOrderByCreatedAtDesc(customerId)).thenReturn(List.of(
                transaction("20.00", "DEBIT"), transaction("100.00", "CREDIT")));

        assertThrows(PaymentDomainException.class, () -> adapter.cancel(paymentId));
        assertEquals(new BigDecimal("70.00"), account.getBalance());
        assertEquals(PaymentStatus.COMPLETED.name(), payment.getStatus());
        verify(transactions, never()).save(any());
    }

    @Test
    void alreadyCancelledPaymentIsIdempotent() {
        payment.setStatus(PaymentStatus.CANCELLED.name());

        var result = adapter.cancel(paymentId);

        assertEquals(PaymentStatus.CANCELLED, result.status());
        verify(accounts, never()).lockByCustomer(customerId);
        verify(transactions, never()).save(any());
    }

    private CreditTransactionEntity transaction(String amount, String type) {
        return new CreditTransactionEntity(UUID.randomUUID(), customerId, paymentId, UUID.randomUUID(),
                new BigDecimal(amount), type);
    }
}
