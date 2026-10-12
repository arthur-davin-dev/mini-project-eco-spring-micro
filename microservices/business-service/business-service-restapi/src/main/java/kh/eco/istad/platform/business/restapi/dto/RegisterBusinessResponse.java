package kh.eco.istad.platform.business.restapi.dto;

import java.util.UUID;

public record RegisterBusinessResponse(
        UUID businessId,
        String legalName,
        String displayName,
        String email,
        String phoneNumber,
        boolean active,
        String message
) {
}