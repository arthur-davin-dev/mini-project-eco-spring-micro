package kh.eco.istad.platform.business.domain.dto;

import java.util.UUID;
import java.math.BigDecimal;
import java.util.List;

public record RegisterBusinessResult(
        UUID businessId,
        String legalName,
        String displayName,
        String email,
        String phoneNumber,
        boolean active,
        String message,
        List<ProductResult> products
) {
    public RegisterBusinessResult(UUID businessId, String legalName, String displayName, String email,
                                  String phoneNumber, boolean active, String message) {
        this(businessId, legalName, displayName, email, phoneNumber, active, message, List.of());
    }
    public record ProductResult(UUID productId, String name, BigDecimal price, int quantity, boolean available) { }
}
