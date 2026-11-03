package kh.eco.istad.platform.order.persistence.entity;

import java.util.UUID;

public record OrderItemEntityId(
        UUID id,
        UUID orderId
) {
}
