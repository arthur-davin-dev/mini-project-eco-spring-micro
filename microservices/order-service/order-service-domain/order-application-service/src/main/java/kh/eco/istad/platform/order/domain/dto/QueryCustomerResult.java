package kh.eco.istad.platform.order.domain.dto;

public record QueryCustomerResult(
        String customerId,
        String givenName,
        String username,
        String familyName,
        String email,
        String phoneNumber,
        String status
) {
}
