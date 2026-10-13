package kh.eco.istad.platform.business.restapi.dto;

import java.util.UUID;
import java.util.List;
import java.math.BigDecimal;

public record RegisterBusinessResponse(
        UUID businessId,
        String legalName,
        String displayName,
        String email,
        String phoneNumber,
        boolean active,
        String message,
        List<ProductResponse> products
) {
    public RegisterBusinessResponse(UUID businessId, String legalName, String displayName, String email,
                                    String phoneNumber, boolean active, String message) {
        this(businessId, legalName, displayName, email, phoneNumber, active, message, List.of());
    }
    public record ProductResponse(UUID productId, String name, BigDecimal price, int quantity, boolean available) { }
}
