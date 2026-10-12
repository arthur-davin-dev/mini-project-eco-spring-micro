package kh.eco.istad.platform.order.domain.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemCommand(
        UUID productId,
        int quantity,
        BigDecimal price,
        BigDecimal subTotal) {
}