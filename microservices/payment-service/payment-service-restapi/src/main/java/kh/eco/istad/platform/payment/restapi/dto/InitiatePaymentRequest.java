package kh.eco.istad.platform.payment.restapi.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import java.math.BigDecimal;
import java.util.UUID;
public record InitiatePaymentRequest(
        @NotNull
        UUID customerId,
        @NotNull
        UUID orderId,
        @NotNull
        @DecimalMin(value = "0.01")
        @Digits(integer = 17, fraction = 2)
        BigDecimal amount
) { }
