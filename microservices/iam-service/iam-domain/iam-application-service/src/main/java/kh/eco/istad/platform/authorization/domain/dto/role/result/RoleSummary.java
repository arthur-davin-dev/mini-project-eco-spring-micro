package kh.eco.istad.platform.authorization.domain.dto.role.result;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RoleSummary(
        UUID uuid,
        String name,
        String description,
        boolean system,
        boolean active,
        List<String> permissions,
        Instant createdAt,
        Instant updatedAt
) {
    public RoleSummary {
        permissions = List.copyOf(permissions);
    }
}
