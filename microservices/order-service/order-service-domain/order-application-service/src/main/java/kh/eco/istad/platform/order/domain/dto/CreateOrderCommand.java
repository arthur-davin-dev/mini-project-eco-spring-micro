package kh.eco.istad.platform.order.domain.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateOrderCommand(
        UUID customerId,
        UUID businessId,
        AddressCommand address,
        BigDecimal price,
        List<OrderItemCommand> items
) {
}