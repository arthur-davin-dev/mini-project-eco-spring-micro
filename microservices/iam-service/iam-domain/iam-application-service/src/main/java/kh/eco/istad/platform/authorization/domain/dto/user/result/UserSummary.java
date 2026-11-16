package kh.eco.istad.platform.authorization.domain.dto.user.result;

import kh.eco.istad.platform.authorization.domain.dto.role.result.RoleRef;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UserSummary(
        UUID uuid,
        String username,
        String email,
        String name,
        String givenName,
        String familyName,
        String pictureUrl,
        String locale,
        boolean enabled,
        boolean accountNonLocked,
        List<RoleRef> roles,
        Instant createdAt,
        Instant updatedAt
) {
    public UserSummary {
        roles = List.copyOf(roles);
    }

    public UserSummary(
            UUID uuid,
            String username,
            String email,
            String name,
            String locale,
            boolean enabled,
            boolean accountNonLocked,
            List<RoleRef> roles,
            Instant createdAt,
            Instant updatedAt
    ) {
        this(uuid, username, email, name, null, null, null, locale, enabled, accountNonLocked, roles, createdAt, updatedAt);
    }
}
