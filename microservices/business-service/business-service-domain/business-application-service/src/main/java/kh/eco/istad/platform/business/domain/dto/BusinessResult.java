package kh.eco.istad.platform.business.domain.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BusinessResult(UUID businessId, String legalName, String displayName, String email,
                             String phoneNumber, boolean active, List<ProductResult> products) {
    public record ProductResult(UUID productId, String name, BigDecimal price, int quantity, boolean available) { }
}
