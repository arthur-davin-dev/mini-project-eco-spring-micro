package kh.eco.istad.platform.order.client.customer;

import java.util.UUID;

public record CustomerPayload(
        UUID customerId,
        String username,
        String familyName,
        String givenName,
        String email,
        String phoneNumber,
        String status
) {
}