package kh.eco.istad.platform.order.persistence.entity;

import java.util.UUID;

public record BusinessEntityId(
        UUID businessId,
        UUID productId
) {
}
