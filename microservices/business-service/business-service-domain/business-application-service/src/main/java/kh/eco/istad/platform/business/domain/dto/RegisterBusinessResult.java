package kh.eco.istad.platform.business.domain.dto;

import java.util.UUID;

public record RegisterBusinessResult(
        UUID businessId,
        String legalName,
        String displayName,
        String email,
        String phoneNumber,
        boolean active,
        String message
) {
}