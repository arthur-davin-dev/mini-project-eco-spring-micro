package kh.eco.istad.platform.payment.domain.service;

import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.common.domain.exception.ConflictException;
import kh.eco.istad.platform.payment.domain.exception.PaymentDomainException;
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
        requireArguments(payment, creditHistories, failureMessages);
        payment.validatePayment(failureMessages);
        if (failureMessages.isEmpty()) {
            payment.initializePayment();
            validateCreditEntry(payment, creditEntry, failureMessages);
        }
        // Only touch the credit when everything so far is valid, so a failed payment changes nothing.
        if (failureMessages.isEmpty()) {
            validateCreditHistory(creditEntry, creditHistories, failureMessages);
        }

        if (failureMessages.isEmpty()) {
            creditEntry.subtractCreditAmount(payment.getPrice());
            addCreditHistory(payment, creditHistories, TransactionType.DEBIT);
            payment.updateStatus(PaymentStatus.COMPLETED);
            return new PaymentCompletedEvent(payment, ZonedDateTime.now(UTC), failureMessages);
        }
        if (payment.getPaymentStatus() == null) payment.updateStatus(PaymentStatus.FAILED);
        return new PaymentFailedEvent(payment, ZonedDateTime.now(UTC), failureMessages);
    }

    @Override
    public PaymentEvent validateAndCancelPayment(
            Payment payment,
            CreditEntry creditEntry,
            List<CreditHistory> creditHistories,
            List<String> failureMessages
    ) {
        requireArguments(payment, creditHistories, failureMessages);
        payment.validatePayment(failureMessages);
        if (payment.getPaymentStatus() != PaymentStatus.COMPLETED) {
            throw new ConflictException("Only a completed payment can be cancelled");
        }
        if (creditEntry == null) failureMessages.add("Customer credit account does not exist");
        else if (payment.getCustomerId() == null || !payment.getCustomerId().equals(creditEntry.getCustomerId()))
            failureMessages.add("Credit account does not belong to the payment customer");

        if (failureMessages.isEmpty()) {
            validateCreditHistory(creditEntry, creditHistories, failureMessages);
        }

        if (failureMessages.isEmpty()) {
            creditEntry.addCreditAmount(payment.getPrice());
            addCreditHistory(payment, creditHistories, TransactionType.CREDIT);
            payment.updateStatus(PaymentStatus.CANCELLED);
            return new PaymentCancelledEvent(payment, ZonedDateTime.now(UTC), failureMessages);
        }
        return new PaymentFailedEvent(payment, ZonedDateTime.now(UTC), failureMessages);
    }

    private void validateCreditEntry(Payment payment, CreditEntry creditEntry, List<String> failureMessages) {
        if (creditEntry == null) {
            failureMessages.add("Customer credit account does not exist");
            return;
        }
        if (!payment.getCustomerId().equals(creditEntry.getCustomerId())) {
            failureMessages.add("Credit account does not belong to the payment customer");
            return;
        }
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
        if (creditHistories.stream().anyMatch(history -> history == null
                || history.getAmount() == null || !history.getAmount().isGreaterThanZero()
                || history.getTransactionType() == null)) {
            throw new PaymentDomainException("Credit history contains invalid entries");
        }
        return creditHistories.stream()
                .filter(history -> history.getTransactionType() == type)
                .map(CreditHistory::getAmount)
                .reduce(Money.ZERO, Money::add);
    }

    private void requireArguments(Payment payment, List<CreditHistory> histories, List<String> failures) {
        if (payment == null) throw new IllegalArgumentException("Payment is required");
        if (histories == null) throw new IllegalArgumentException("Credit history is required");
        if (failures == null) throw new IllegalArgumentException("Failure messages are required");
    }
}
