package kh.eco.istad.platform.authorization.domain.dto.permission.result;

import java.time.Instant;
import java.util.UUID;

public record PermissionAssignmentResult(
        UUID permissionUuid,
        String permissionName,
        Instant expiresAt
) {
}
