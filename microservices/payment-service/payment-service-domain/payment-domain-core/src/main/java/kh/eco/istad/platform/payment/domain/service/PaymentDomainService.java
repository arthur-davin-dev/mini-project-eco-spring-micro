package kh.eco.istad.platform.payment.domain.service;

import kh.eco.istad.platform.payment.domain.entity.CreditEntry;
import kh.eco.istad.platform.payment.domain.entity.CreditHistory;
import kh.eco.istad.platform.payment.domain.entity.Payment;
import kh.eco.istad.platform.payment.domain.event.PaymentEvent;

import java.util.List;

public interface PaymentDomainService {

    PaymentEvent validateAndInitiatePayment(
            Payment payment,
            CreditEntry creditEntry,
            List<CreditHistory> creditHistories,
            List<String> failureMessages
    );
    PaymentEvent validateAndCancelPayment(
            Payment payment,
            CreditEntry creditEntry,
            List<CreditHistory> creditHistories,
            List<String> failureMessages
    );
}