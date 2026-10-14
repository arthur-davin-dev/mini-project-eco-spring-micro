package kh.eco.istad.platform.order.restapi.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(
        @NotNull(message = "customerId is required")
        UUID customerId,
        @NotNull(message = "businessId is required")
        UUID businessId,
        @NotNull(message = "address is required")
        @Valid AddressRequest address,
        @NotNull(message = "price is required")
        @Positive(message = "price must be greater than 0")
        @Digits(integer = 17, fraction = 2, message = "price must have at most 2 decimal places")
        BigDecimal price,
        @NotEmpty(message = "items must not be empty")
        List<@NotNull(message = "items must not contain null entries") @Valid OrderItemRequest> items
) {
}
