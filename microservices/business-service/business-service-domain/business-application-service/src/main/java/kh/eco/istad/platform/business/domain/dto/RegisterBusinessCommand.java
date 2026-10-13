package kh.eco.istad.platform.business.domain.dto;

import java.math.BigDecimal;
import java.util.List;

public record RegisterBusinessCommand(
        String legalName,
        String displayName,
        String email,
        String phoneNumber,
        List<ProductCommand> products
) {
    public RegisterBusinessCommand(String legalName, String displayName, String email, String phoneNumber) {
        this(legalName, displayName, email, phoneNumber, null);
    }
    public record ProductCommand(String name, BigDecimal price, int quantity) { }
}
