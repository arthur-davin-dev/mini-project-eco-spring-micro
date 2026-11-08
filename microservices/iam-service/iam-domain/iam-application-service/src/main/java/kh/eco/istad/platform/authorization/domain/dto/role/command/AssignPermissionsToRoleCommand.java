package kh.eco.istad.platform.authorization.domain.dto.role.command;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AssignPermissionsToRoleCommand(
        List<UUID> permissionUuids,
        Instant expiresAt,
        String reason
) {

    public AssignPermissionsToRoleCommand {
        permissionUuids = permissionUuids == null ? List.of() : List.copyOf(permissionUuids);
    }
}
