package kh.eco.istad.platform.order.domain.dto;

import java.util.UUID;

public record AddressCommand(
        UUID id,
        String street,
        String postalCode,
        String city
) {
}
