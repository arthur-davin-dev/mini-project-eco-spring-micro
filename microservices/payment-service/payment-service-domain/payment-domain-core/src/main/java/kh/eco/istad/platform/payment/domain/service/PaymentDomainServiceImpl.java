package kh.eco.istad.platform.payment.domain.service;

import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.payment.domain.entity.CreditEntry;
import kh.eco.istad.platform.payment.domain.entity.CreditHistory;
import kh.eco.istad.platform.payment.domain.entity.Payment;
import kh.eco.istad.platform.payment.domain.event.PaymentCancelledEvent;
import kh.eco.istad.platform.payment.domain.event.PaymentCompletedEvent;
import kh.eco.istad.platform.payment.domain.event.PaymentEvent;
import kh.eco.istad.platform.payment.domain.event.PaymentFailedEvent;
import kh.eco.istad.platform.payment.domain.valueobject.CreditHistoryId;
import kh.eco.istad.platform.payment.domain.valueobject.PaymentStatus;
import kh.eco.istad.platform.payment.domain.valueobject.TransactionType;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public class PaymentDomainServiceImpl implements PaymentDomainService {

    private static final ZoneId UTC = ZoneId.of("UTC");

    @Override
    public PaymentEvent validateAndInitiatePayment(
            Payment payment,
            CreditEntry creditEntry,
            List<CreditHistory> creditHistories,
            List<String> failureMessages
    ) {
        payment.validatePayment(failureMessages);
        payment.initializePayment();

        if (failureMessages.isEmpty()) {
            validateCreditEntry(payment, creditEntry, failureMessages);
        }
        // Only touch the credit when everything so far is valid, so a failed payment changes nothing.
        if (failureMessages.isEmpty()) {
            creditEntry.subtractCreditAmount(payment.getPrice());
            addCreditHistory(payment, creditHistories, TransactionType.DEBIT);
            validateCreditHistory(creditEntry, creditHistories, failureMessages);
        }

        if (failureMessages.isEmpty()) {
            payment.updateStatus(PaymentStatus.COMPLETED);
            return new PaymentCompletedEvent(payment, ZonedDateTime.now(UTC), failureMessages);
        }
        payment.updateStatus(PaymentStatus.FAILED);
        return new PaymentFailedEvent(payment, ZonedDateTime.now(UTC), failureMessages);
    }

    @Override
    public PaymentEvent validateAndCancelPayment(
            Payment payment,
            CreditEntry creditEntry,
            List<CreditHistory> creditHistories,
            List<String> failureMessages
    ) {
        payment.validatePayment(failureMessages);

        if (failureMessages.isEmpty()) {
            creditEntry.addCreditAmount(payment.getPrice());
            addCreditHistory(payment, creditHistories, TransactionType.CREDIT);
            validateCreditHistory(creditEntry, creditHistories, failureMessages);
        }

        if (failureMessages.isEmpty()) {
            payment.updateStatus(PaymentStatus.CANCELLED);
            return new PaymentCancelledEvent(payment, ZonedDateTime.now(UTC), failureMessages);
        }
        payment.updateStatus(PaymentStatus.FAILED);
        return new PaymentFailedEvent(payment, ZonedDateTime.now(UTC), failureMessages);
    }

    private void validateCreditEntry(Payment payment, CreditEntry creditEntry, List<String> failureMessages) {
        if (payment.getPrice().isGreaterThan(creditEntry.getTotalCreditAmount())) {
            failureMessages.add("Customer with id=" + payment.getCustomerId().value()
                    + " doesn't have enough credit for payment!");
        }
    }

    private void addCreditHistory(Payment payment, List<CreditHistory> creditHistories,
                                  TransactionType transactionType) {
        creditHistories.add(new CreditHistory(
                new CreditHistoryId(UUID.randomUUID()),
                payment.getCustomerId(),
                payment.getPrice(),
                transactionType));
    }

    private void validateCreditHistory(CreditEntry creditEntry, List<CreditHistory> creditHistories,
                                       List<String> failureMessages) {
        Money totalCredit = sumByType(creditHistories, TransactionType.CREDIT);
        Money totalDebit = sumByType(creditHistories, TransactionType.DEBIT);

        if (totalDebit.isGreaterThan(totalCredit)) {
            failureMessages.add("Customer with id=" + creditEntry.getCustomerId().value()
                    + " doesn't have enough credit according to credit history!");
        }
        if (!creditEntry.getTotalCreditAmount().equals(totalCredit.subtract(totalDebit))) {
            failureMessages.add("Credit history total is not equal to current credit for customer id: "
                    + creditEntry.getCustomerId().value() + "!");
        }
    }

    private Money sumByType(List<CreditHistory> creditHistories, TransactionType type) {
        return creditHistories.stream()
                .filter(history -> history.getTransactionType() == type)
                .map(CreditHistory::getAmount)
                .reduce(Money.ZERO, Money::add);
    }
}