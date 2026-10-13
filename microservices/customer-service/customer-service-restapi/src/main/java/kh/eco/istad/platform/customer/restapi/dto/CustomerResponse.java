package kh.eco.istad.platform.customer.restapi.dto;

import java.util.UUID;

public record CustomerResponse(
        UUID customerId,
        String username,
        String familyName,
        String givenName,
        String email,
        String phoneNumber,
        String status
) {
}