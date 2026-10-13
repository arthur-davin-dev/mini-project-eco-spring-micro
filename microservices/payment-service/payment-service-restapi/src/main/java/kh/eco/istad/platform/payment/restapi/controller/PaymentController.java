package kh.eco.istad.platform.payment.restapi.controller;

import jakarta.validation.Valid;
import kh.eco.istad.common.domain.valueobject.Money;
import kh.eco.istad.platform.payment.domain.port.out.PaymentStore;
import kh.eco.istad.platform.payment.domain.usecase.PaymentUseCases;
import kh.eco.istad.platform.payment.restapi.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class PaymentController {
    private final PaymentUseCases useCases;

    public PaymentController(PaymentUseCases useCases) {
        this.useCases = useCases;
    }

    @PostMapping("/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentView initiate(
            @Valid @RequestBody InitiatePaymentRequest r,
            @RequestHeader(value = "Idempotency-Key", required = false
            ) String key) {
        return PaymentView.from(
                useCases.initiate(
                        r.customerId(), r.orderId(), new Money(r.amount()), key));
    }

    @GetMapping("/payments/{id}")
    public PaymentView get(@PathVariable("id") UUID id) {
        return PaymentView.from(useCases.payment(id));
    }

    @GetMapping("/payments/order/{orderId}")
    public PaymentView byOrder(@PathVariable("orderId") UUID orderId) {
        return PaymentView.from(useCases.byOrder(orderId));
    }

    @PostMapping("/payments/{id}/cancel")
    public PaymentView cancel(@PathVariable("id") UUID id) {
        return PaymentView.from(useCases.cancel(id));
    }

    @PostMapping("/credits/accounts")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@Valid @RequestBody CreateAccountRequest r) {
        useCases.createAccount(r.customerId(), new Money(r.initialCredit()));
        return Map.of("customerId", r.customerId(), "balance", r.initialCredit());
    }

    @GetMapping("/credits/accounts/{customerId}")
    public Map<String, Object> balance(@PathVariable("customerId") UUID customerId) {
        return Map.of("customerId", customerId, "balance", useCases.balance(customerId).amount());
    }

    @PostMapping("/credits/accounts/{customerId}/top-ups")
    public Map<String, Object> topUp(@PathVariable("customerId") UUID customerId, @Valid @RequestBody AmountRequest r, @RequestHeader(value = "Idempotency-Key") UUID operationId) {
        Money balance = useCases.topUp(customerId, new Money(r.amount()), operationId);
        return Map.of("customerId", customerId, "balance", balance.amount());
    }

    @GetMapping("/credits/accounts/{customerId}/history")
    public List<PaymentStore.CreditRecord> history(@PathVariable("customerId") UUID customerId) {
        return useCases.history(customerId);
    }

    public record CreateAccountRequest(@jakarta.validation.constraints.NotNull UUID customerId,
                                       @jakarta.validation.constraints.NotNull @jakarta.validation.constraints.DecimalMin("0.00") BigDecimal initialCredit) {
    }

    public record PaymentView(UUID paymentId, UUID orderId, UUID customerId, BigDecimal amount, String status,
                              java.time.Instant createdAt) {
        static PaymentView from(PaymentStore.PaymentRecord r) {
            return new PaymentView(r.id().value(), r.orderId().value(), r.customerId().value(), r.amount().amount(), r.status().name(), r.createdAt());
        }
    }
}
