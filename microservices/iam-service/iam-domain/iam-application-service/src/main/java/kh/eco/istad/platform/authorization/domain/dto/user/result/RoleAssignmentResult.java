package kh.eco.istad.platform.authorization.domain.dto.user.result;

import java.time.Instant;
import java.util.UUID;

public record RoleAssignmentResult(
        UUID roleUuid,
        String roleName,
        Instant expiresAt
) {
}
