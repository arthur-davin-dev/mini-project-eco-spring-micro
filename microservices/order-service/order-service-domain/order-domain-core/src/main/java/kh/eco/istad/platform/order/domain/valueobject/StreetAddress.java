package kh.eco.istad.platform.order.domain.valueobject;

import kh.eco.istad.platform.order.domain.exception.OrderDomainException;

import java.util.UUID;

public record StreetAddress(
        UUID id,
        String street,
        String postalCode,
        String city
) {

    public StreetAddress {
        if (isBlank(street)) {
            throw new OrderDomainException("Street must not be blank");
        }
        if (isBlank(postalCode)) {
            throw new OrderDomainException("Postal code must not be blank");
        }
        if (isBlank(city)) {
            throw new OrderDomainException("City must not be blank");
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}