package kh.eco.istad.platform.customer.domain.dto;

import java.util.UUID;

public record CustomerResult(
        UUID customerId,
        String username,
        String familyName,
        String givenName,
        String email,
        String phoneNumber,
        String status
) {
}