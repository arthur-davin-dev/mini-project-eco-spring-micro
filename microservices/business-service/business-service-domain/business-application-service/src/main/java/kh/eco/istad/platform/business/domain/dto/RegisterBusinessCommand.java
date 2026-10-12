package kh.eco.istad.platform.business.domain.dto;

public record RegisterBusinessCommand(
        String legalName,
        String displayName,
        String email,
        String phoneNumber
) {
}