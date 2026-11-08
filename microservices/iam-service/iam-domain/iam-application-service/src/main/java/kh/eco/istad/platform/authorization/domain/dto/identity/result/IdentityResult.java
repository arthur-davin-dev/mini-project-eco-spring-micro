package kh.eco.istad.platform.authorization.domain.dto.identity.result;

import kh.eco.istad.platform.authorization.domain.entity.user.IdentityProvider;

import java.time.Instant;
import java.util.UUID;

public record IdentityResult(
        UUID uuid,
        IdentityProvider provider,
        String email,
        String displayName,
        Instant linkedAt,
        Instant lastLoginAt
) {
}
