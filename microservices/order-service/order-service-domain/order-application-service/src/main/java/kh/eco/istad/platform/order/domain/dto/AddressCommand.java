package kh.eco.istad.platform.order.domain.dto;

public record AddressCommand(
        String street,
        String postalCode,
        String city) {
}