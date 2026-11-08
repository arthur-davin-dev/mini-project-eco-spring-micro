package kh.eco.istad.platform.authorization.domain.dto.permission.result;

import java.time.Instant;
import java.util.UUID;

public record PermissionResult(
        UUID uuid,
        String name,
        String resource,
        String action,
        String description,
        boolean system,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}
