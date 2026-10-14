package kh.eco.istad.platform.order.client.business;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BusinessServicePayload(
        UUID businessId,
        String legalName,
        String displayName,
        String email,
        String phoneNumber,
        boolean active,
        List<ProductPayload> products
) {
    public record ProductPayload(
            UUID productId,
            String name,
            BigDecimal price,
            int quantity,
            boolean available
    ) { }
}
