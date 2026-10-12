package kh.eco.istad.platform.order.restapi.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemRequest(
        @NotNull(message = "productId is required") UUID productId,
        @Positive(message = "quantity must be greater than 0") Integer quantity,
        @NotNull(message = "price is required") @Positive(message = "price must be greater than 0") BigDecimal price,
        @NotNull(message = "subTotal is required") @Positive(message = "subTotal must be greater than 0") BigDecimal subTotal
) {
}