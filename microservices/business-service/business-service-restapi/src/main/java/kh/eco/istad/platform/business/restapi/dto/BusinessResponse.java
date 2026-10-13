package kh.eco.istad.platform.business.restapi.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BusinessResponse(UUID businessId, String legalName, String displayName, String email,
                               String phoneNumber, boolean active, List<ProductResponse> products) {
    public record ProductResponse(UUID productId, String name, BigDecimal price, int quantity, boolean available) { }
}
