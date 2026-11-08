package kh.eco.istad.platform.authorization.domain.dto.user.command;

import kh.eco.istad.platform.authorization.domain.entity.assignment.PermissionEffect;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record GrantPermissionsToUserCommand(
        List<UUID> permissionUuids,
        PermissionEffect effect,
        Instant expiresAt,
        String reason
) {
    public GrantPermissionsToUserCommand {
        permissionUuids = permissionUuids == null ? List.of() : List.copyOf(permissionUuids);
    }
}
