package kh.eco.istad.platform.authorization.domain.dto.user.result;

import kh.eco.istad.platform.authorization.domain.entity.user.UserProfile;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AuthUserResult(
        UUID uuid,
        String username,
        String email,
        boolean emailVerified,
        UserProfile profile,
        Instant updatedAt,
        String passwordHash,
        boolean enabled,
        boolean accountNonExpired,
        boolean accountNonLocked,
        boolean credentialsNonExpired,
        List<String> authorities
) {
    public AuthUserResult {
        if (uuid == null || profile == null) {
            throw new IllegalArgumentException("Authentication identity and profile are required");
        }
        authorities = List.copyOf(authorities);
    }
}
