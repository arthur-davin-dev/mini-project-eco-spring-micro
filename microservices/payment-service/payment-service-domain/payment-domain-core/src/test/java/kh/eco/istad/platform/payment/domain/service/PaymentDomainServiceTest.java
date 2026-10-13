package kh.eco.istad.platform.payment.domain.service;

import kh.eco.istad.common.domain.valueobject.CustomerId;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.valueobject.OrderId;
import kh.eco.istad.platform.payment.domain.entity.CreditEntry;
import kh.eco.istad.platform.payment.domain.entity.CreditHistory;
import kh.eco.istad.platform.payment.domain.entity.Payment;
import kh.eco.istad.platform.payment.domain.event.PaymentCancelledEvent;
import kh.eco.istad.platform.payment.domain.event.PaymentCompletedEvent;
import kh.eco.istad.platform.payment.domain.event.PaymentEvent;
import kh.eco.istad.platform.payment.domain.event.PaymentFailedEvent;
import kh.eco.istad.platform.payment.domain.valueobject.CreditEntryId;
import kh.eco.istad.platform.payment.domain.valueobject.CreditHistoryId;
import kh.eco.istad.platform.payment.domain.valueobject.PaymentStatus;
import kh.eco.istad.platform.payment.domain.valueobject.TransactionType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PaymentDomainServiceTest {

    private final PaymentDomainService service = new PaymentDomainServiceImpl();
    private final CustomerId customerId = new CustomerId(UUID.randomUUID());

    private Money money(String value) {
        return new Money(new BigDecimal(value));
    }

    private Payment payment(String price) {
        return new Payment(new OrderId(UUID.randomUUID()), customerId, money(price));
    }

    private CreditEntry creditEntry(String amount) {
        return new CreditEntry(new CreditEntryId(UUID.randomUUID()), customerId, money(amount));
    }

    private CreditHistory history(String amount, TransactionType type) {
        return new CreditHistory(new CreditHistoryId(UUID.randomUUID()), customerId, money(amount), type);
    }

    @Test
    void paymentCompletesWhenCustomerHasEnoughCredit() {
        CreditEntry entry = creditEntry("100.00");
        List<CreditHistory> histories = new ArrayList<>(List.of(history("100.00", TransactionType.CREDIT)));
        List<String> failures = new ArrayList<>();
        Payment payment = payment("30.00");
        PaymentEvent event = service.validateAndInitiatePayment(payment, entry, histories, failures);

        assertInstanceOf(PaymentCompletedEvent.class, event);
        assertTrue(failures.isEmpty());
        assertNotNull(payment.getId());
        assertEquals(PaymentStatus.COMPLETED, payment.getPaymentStatus());
        assertEquals(money("70.00"), entry.getTotalCreditAmount());
        assertEquals(2, histories.size());
    }

    @Test
    void paymentFailsWithoutChangingCreditWhenNotEnoughCredit() {
        CreditEntry entry = creditEntry("20.00");
        List<CreditHistory> histories = new ArrayList<>(List.of(history("20.00", TransactionType.CREDIT)));
        List<String> failures = new ArrayList<>();
        Payment payment = payment("30.00");

        PaymentEvent event = service.validateAndInitiatePayment(payment, entry, histories, failures);

        assertInstanceOf(PaymentFailedEvent.class, event);
        assertFalse(failures.isEmpty());
        assertEquals(PaymentStatus.FAILED, payment.getPaymentStatus());
        assertEquals(money("20.00"), entry.getTotalCreditAmount());
        assertEquals(1, histories.size());
    }

    @Test
    void paymentWithZeroPriceFails() {
        CreditEntry entry = creditEntry("100.00");
        List<CreditHistory> histories = new ArrayList<>(List.of(history("100.00", TransactionType.CREDIT)));
        List<String> failures = new ArrayList<>();

        PaymentEvent event = service.validateAndInitiatePayment(payment("0.00"), entry, histories, failures);

        assertInstanceOf(PaymentFailedEvent.class, event);
        assertEquals(money("100.00"), entry.getTotalCreditAmount());
    }

    @Test
    void inconsistentCreditHistoryFailsThePayment() {
        CreditEntry entry = creditEntry("100.00");
        List<CreditHistory> histories = new ArrayList<>(List.of(history("50.00", TransactionType.CREDIT)));
        List<String> failures = new ArrayList<>();

        PaymentEvent event = service.validateAndInitiatePayment(payment("30.00"), entry, histories, failures);

        assertInstanceOf(PaymentFailedEvent.class, event);
        assertFalse(failures.isEmpty());
    }

    @Test
    void cancellingPaymentRefundsTheCredit() {
        CreditEntry entry = creditEntry("70.00");
        List<CreditHistory> histories = new ArrayList<>(List.of(
                history("100.00", TransactionType.CREDIT),
                history("30.00", TransactionType.DEBIT)));
        List<String> failures = new ArrayList<>();
        Payment payment = payment("30.00");
        payment.initializePayment();
        payment.updateStatus(PaymentStatus.COMPLETED);

        PaymentEvent event = service.validateAndCancelPayment(payment, entry, histories, failures);

        assertInstanceOf(PaymentCancelledEvent.class, event);
        assertEquals(PaymentStatus.CANCELLED, payment.getPaymentStatus());
        assertEquals(money("100.00"), entry.getTotalCreditAmount());
        assertEquals(3, histories.size());
    }

    @Test
    void cancellingAnUnpaidPaymentDoesNotChangeCredit() {
        CreditEntry entry = creditEntry("70.00");
        List<CreditHistory> histories = new ArrayList<>(List.of(
                history("100.00", TransactionType.CREDIT), history("30.00", TransactionType.DEBIT)));
        List<String> failures = new ArrayList<>();
        Payment payment = payment("30.00");
        payment.initializePayment();
        payment.updateStatus(PaymentStatus.FAILED);

        PaymentEvent event = service.validateAndCancelPayment(payment, entry, histories, failures);

        assertInstanceOf(PaymentFailedEvent.class, event);
        assertEquals(money("70.00"), entry.getTotalCreditAmount());
        assertEquals(2, histories.size());
    }
}
