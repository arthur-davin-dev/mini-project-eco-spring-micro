package kh.eco.istad.platform.payment.restapi.dto;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;
public record InitiatePaymentRequest(
        @NotNull
        UUID customerId,
        @NotNull
        UUID orderId,
        @NotNull
        BigDecimal amount
) { }
